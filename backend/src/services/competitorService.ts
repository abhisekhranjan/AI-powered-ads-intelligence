import { CompetitorAnalysis } from '../models/types.js'
import { competitorAnalysisRepository } from '../models/index.js'

export class CompetitorService {
  async analyzeCompetitors(sessionId: string, urls: string[]): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = []
    
    for (const url of urls) {
      const analysis = await competitorAnalysisRepository.createAnalysis({
        session_id: sessionId,
        competitor_url: url,
        positioning: { unique_value_proposition: 'Competitor analysis', target_market: 'B2B' },
        audience_insights: { demographics: { age_ranges: ['25-44'] } }
      })
      analyses.push(analysis)
    }
    
    return analyses
  }
}

export const competitorService = new CompetitorService()
