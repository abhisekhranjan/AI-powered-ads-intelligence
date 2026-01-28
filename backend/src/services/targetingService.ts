import { TargetingRecommendation } from '../models/types.js'
import { targetingRecommendationRepository, websiteAnalysisRepository } from '../models/index.js'
import { logger } from '../config/logger.js'

export class TargetingService {
  async getRecommendationsBySession(sessionId: string) {
    return await targetingRecommendationRepository.findBySessionId(sessionId)
  }

  async generateMetaTargeting(sessionId: string, websiteData: any): Promise<TargetingRecommendation> {
    try {
      logger.info(`Generating Meta targeting for session: ${sessionId}`)
      
      // Get website analysis data
      const analysis = await websiteAnalysisRepository.findBySessionId(sessionId)
      
      if (!analysis) {
        throw new Error('No website analysis found')
      }

      // Generate interests based on business model and content
      const interests = this.generateMetaInterests(analysis)
      
      // Generate behaviors
      const behaviors = this.generateMetaBehaviors(analysis)
      
      // Generate demographics
      const demographics = this.generateDemographics(analysis)

      const targetingData = {
        demographics,
        interests,
        behaviors,
        detailed_targeting: {
          include: interests.slice(0, 10).map(i => i.interests).flat(),
          exclude: ['Irrelevant audiences'],
          narrow: []
        },
        placements: ['Facebook Feed', 'Instagram Feed', 'Instagram Stories', 'Audience Network'],
        optimization_goal: 'conversions'
      }

      return await targetingRecommendationRepository.createRecommendation({
        session_id: sessionId,
        platform: 'meta',
        targeting_data: targetingData
      })
    } catch (error) {
      logger.error(`Meta targeting generation failed:`, error)
      throw error
    }
  }

  async generateGoogleTargeting(sessionId: string, websiteData: any): Promise<TargetingRecommendation> {
    try {
      logger.info(`Generating Google targeting for session: ${sessionId}`)
      
      // Get website analysis data
      const analysis = await websiteAnalysisRepository.findBySessionId(sessionId)
      
      if (!analysis) {
        throw new Error('No website analysis found')
      }

      // Generate keywords based on content themes
      const keywords = this.generateGoogleKeywords(analysis)
      
      // Generate audiences
      const audiences = this.generateGoogleAudiences(analysis)
      
      // Generate demographics
      const demographics = this.generateDemographics(analysis)

      const targetingData = {
        keywords,
        audiences,
        demographics: {
          age_min: demographics.age_min,
          age_max: demographics.age_max,
          genders: demographics.genders,
          locations: demographics.locations
        },
        campaign_types: ['Search', 'Performance Max', 'Display'],
        bidding_strategy: 'Target CPA'
      }

      return await targetingRecommendationRepository.createRecommendation({
        session_id: sessionId,
        platform: 'google',
        targeting_data: targetingData
      })
    } catch (error) {
      logger.error(`Google targeting generation failed:`, error)
      throw error
    }
  }

  private generateMetaInterests(analysis: any) {
    const businessModel = analysis.business_model
    const themes = analysis.content_themes || []
    
    const interestMap: Record<string, string[]> = {
      saas: ['Business software', 'Technology', 'Entrepreneurship', 'Small business', 'Marketing automation', 'Cloud computing'],
      ecommerce: ['Online shopping', 'E-commerce', 'Retail', 'Fashion', 'Consumer goods', 'Shopping and fashion'],
      service: ['Business services', 'Professional services', 'Consulting', 'B2B', 'Small business', 'Entrepreneurship'],
      education: ['Online learning', 'Education', 'Professional development', 'Career development', 'Training'],
      marketplace: ['E-commerce', 'Online marketplace', 'Buying and selling', 'Entrepreneurship'],
      media: ['News and media', 'Content creation', 'Publishing', 'Digital media']
    }

    const baseInterests = interestMap[businessModel] || interestMap.service
    
    return baseInterests.map((interest, index) => ({
      category: businessModel === 'saas' ? 'Technology' : 'Business',
      interests: [interest],
      confidence: Math.max(0.6, 0.9 - (index * 0.05)),
      reasoning: `Relevant to ${businessModel} business model`
    }))
  }

  private generateMetaBehaviors(analysis: any) {
    const businessModel = analysis.business_model
    
    const behaviorMap: Record<string, any[]> = {
      saas: [
        { behavior: 'Technology early adopters', confidence: 0.8, reasoning: 'Likely to adopt new software' },
        { behavior: 'Small business owners', confidence: 0.85, reasoning: 'Primary target for B2B SaaS' },
        { behavior: 'Engaged shoppers', confidence: 0.7, reasoning: 'Active online users' }
      ],
      ecommerce: [
        { behavior: 'Online shoppers', confidence: 0.9, reasoning: 'Primary audience for e-commerce' },
        { behavior: 'Engaged shoppers', confidence: 0.85, reasoning: 'Frequent purchasers' },
        { behavior: 'Mobile device users', confidence: 0.75, reasoning: 'Mobile shopping trend' }
      ],
      service: [
        { behavior: 'Small business owners', confidence: 0.85, reasoning: 'Primary B2B audience' },
        { behavior: 'Business decision makers', confidence: 0.8, reasoning: 'Key decision makers' },
        { behavior: 'Engaged with business content', confidence: 0.75, reasoning: 'Active in business topics' }
      ]
    }

    return behaviorMap[businessModel] || behaviorMap.service
  }

  private generateGoogleKeywords(analysis: any) {
    const businessModel = analysis.business_model
    const themes = analysis.content_themes || []
    
    const keywordMap: Record<string, any> = {
      saas: {
        intent: 'commercial',
        keywords: ['software solution', 'cloud platform', 'business software', 'saas tool', 'automation software'],
        search_volume: 5000,
        competition_level: 'medium',
        opportunities: ['Long-tail keywords', 'Problem-solution keywords']
      },
      ecommerce: {
        intent: 'transactional',
        keywords: ['buy online', 'shop', 'best price', 'discount', 'free shipping'],
        search_volume: 10000,
        competition_level: 'high',
        opportunities: ['Product-specific keywords', 'Brand keywords']
      },
      service: {
        intent: 'commercial',
        keywords: ['professional services', 'consulting', 'business solutions', 'expert help', 'hire consultant'],
        search_volume: 3000,
        competition_level: 'medium',
        opportunities: ['Local keywords', 'Service-specific keywords']
      }
    }

    const baseKeywords = keywordMap[businessModel] || keywordMap.service
    
    return [
      baseKeywords,
      {
        intent: 'informational',
        keywords: ['how to', 'guide', 'tips', 'best practices', 'tutorial'],
        search_volume: 2000,
        competition_level: 'low',
        opportunities: ['Content marketing', 'SEO opportunities']
      }
    ]
  }

  private generateGoogleAudiences(analysis: any) {
    const businessModel = analysis.business_model
    
    return [
      {
        type: 'in-market',
        name: businessModel === 'saas' ? 'Business Software' : 'Business Services',
        size: 'large',
        confidence: 0.85
      },
      {
        type: 'affinity',
        name: 'Business Professionals',
        size: 'medium',
        confidence: 0.75
      },
      {
        type: 'custom-intent',
        name: 'High-intent searchers',
        size: 'medium',
        confidence: 0.8
      }
    ]
  }

  private generateDemographics(analysis: any) {
    const targetAudience = analysis.target_audience || {}
    const demographics = targetAudience.demographics || {}
    
    return {
      age_min: 25,
      age_max: 54,
      genders: demographics.genders || ['all'],
      locations: demographics.locations || ['United States', 'Canada', 'United Kingdom'],
      languages: ['English']
    }
  }
}

export const targetingService = new TargetingService()
