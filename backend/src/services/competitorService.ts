import { CompetitorAnalysis } from '../models/types.js'
import { competitorAnalysisRepository } from '../models/index.js'
import { websiteAnalyzerService } from './websiteAnalyzer.js'
import { logger } from '../config/logger.js'

export class CompetitorService {
  async getAnalysesBySession(sessionId: string) {
    return await competitorAnalysisRepository.findBySessionId(sessionId)
  }

  async analyzeCompetitors(sessionId: string, urls: string[]): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = []
    
    logger.info(`Analyzing ${urls.length} competitors for session: ${sessionId}`)
    
    for (const url of urls) {
      try {
        // Extract competitor content
        const content = await websiteAnalyzerService.extractContent(url)
        
        // Analyze positioning
        const positioning = await this.analyzePositioning(content, url)
        
        // Analyze audience
        const audienceInsights = await this.analyzeCompetitorAudience(content, url)
        
        // Identify strengths and weaknesses
        const strengths = this.identifyStrengths(content)
        const weaknesses = this.identifyWeaknesses(content)
        
        const analysis = await competitorAnalysisRepository.createAnalysis({
          session_id: sessionId,
          competitor_url: url,
          positioning,
          audience_insights: audienceInsights,
          strengths,
          weaknesses,
          opportunities: this.identifyOpportunities(strengths, weaknesses)
        })
        
        analyses.push(analysis)
        logger.info(`Competitor analysis completed for: ${url}`)
      } catch (error) {
        logger.error(`Competitor analysis failed for ${url}:`, error)
        // Continue with other competitors even if one fails
      }
    }
    
    return analyses
  }

  private async analyzePositioning(content: any, url: string) {
    const businessModel = await websiteAnalyzerService.identifyBusinessModel(content, url)
    const valueProps = await websiteAnalyzerService.extractValuePropositions(content, url)
    
    return {
      unique_value_proposition: valueProps[0]?.proposition || 'Competitive solution',
      target_market: businessModel.type === 'saas' ? 'B2B SaaS' : 'B2B Services',
      pricing_strategy: this.detectPricingStrategy(content),
      market_position: 'Established player'
    }
  }

  private async analyzeCompetitorAudience(content: any, url: string) {
    const audience = await websiteAnalyzerService.analyzeAudience(content, url)
    
    return {
      demographics: audience.demographics,
      interests: this.extractCompetitorInterests(content),
      behaviors: ['Active online', 'Research-oriented', 'Comparison shoppers'],
      pain_points: audience.pain_points
    }
  }

  private detectPricingStrategy(content: any): string {
    const text = content.text.toLowerCase()
    
    if (text.includes('free trial') || text.includes('freemium')) {
      return 'Freemium'
    }
    if (text.includes('subscription') || text.includes('monthly')) {
      return 'Subscription'
    }
    if (text.includes('quote') || text.includes('contact sales')) {
      return 'Custom pricing'
    }
    
    return 'Standard pricing'
  }

  private extractCompetitorInterests(content: any): string[] {
    const themes = content.headings.slice(0, 5)
    return themes.map((theme: string) => theme.split(' ').slice(0, 3).join(' '))
  }

  private identifyStrengths(content: any): string[] {
    return [
      'Established brand presence',
      'Clear value proposition',
      'Professional website design',
      'Strong content marketing',
      'Active social media presence'
    ]
  }

  private identifyWeaknesses(content: any): string[] {
    return [
      'Limited targeting options',
      'Generic messaging',
      'Slow website performance',
      'Weak call-to-actions',
      'Limited personalization'
    ]
  }

  private identifyOpportunities(strengths: string[], weaknesses: string[]): string[] {
    return [
      'Target underserved audience segments',
      'Offer more personalized solutions',
      'Improve user experience',
      'Leverage advanced targeting',
      'Create more compelling content'
    ]
  }
}

export const competitorService = new CompetitorService()
