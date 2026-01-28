/**
 * Meta Ads Targeting Generator Service
 * 
 * Generates Meta (Facebook/Instagram) Ads targeting recommendations based on
 * website analysis and competitor intelligence.
 * 
 * Requirements: 2.1, 2.3
 */

import {
  MetaTargeting,
  DemographicTargeting,
  InterestTargeting,
  BehaviorTargeting,
  CustomAudienceRecommendation,
  LookalikeAudience,
  ConfidenceScore,
  WebsiteAnalysis,
  CompetitorAnalysis,
  AudienceInsights,
  LocationTargeting
} from '../models/types.js'
import { BusinessModelClassification } from './businessModelClassifier.js'

// ============================================================================
// Meta Targeting Generation Input
// ============================================================================

export interface MetaTargetingInput {
  websiteAnalysis: WebsiteAnalysis
  businessClassification?: BusinessModelClassification
  competitorAnalyses?: CompetitorAnalysis[]
  targetLocation?: string
}

// ============================================================================
// Meta Interest Categories (Based on Meta's actual categories)
// ============================================================================

const META_INTEREST_CATEGORIES = {
  BUSINESS: [
    'Business and industry',
    'Small business',
    'Entrepreneurship',
    'Business management',
    'Marketing',
    'Sales',
    'Leadership'
  ],
  TECHNOLOGY: [
    'Technology',
    'Software',
    'Cloud computing',
    'Artificial intelligence',
    'Web development',
    'Mobile apps',
    'SaaS'
  ],
  SHOPPING: [
    'Online shopping',
    'Shopping and fashion',
    'Retail',
    'E-commerce',
    'Consumer goods'
  ],
  HEALTH: [
    'Health and wellness',
    'Fitness and wellness',
    'Nutrition',
    'Mental health',
    'Healthcare'
  ],
  FINANCE: [
    'Personal finance',
    'Investing',
    'Banking',
    'Financial planning',
    'Real estate'
  ],
  EDUCATION: [
    'Education',
    'Online learning',
    'Professional development',
    'Career development',
    'Skill development'
  ],
  ENTERTAINMENT: [
    'Entertainment',
    'Movies',
    'Music',
    'Gaming',
    'Streaming services'
  ],
  LIFESTYLE: [
    'Lifestyle',
    'Travel',
    'Food and dining',
    'Home and garden',
    'Parenting'
  ]
} as const

// ============================================================================
// Meta Behavior Categories
// ============================================================================

const META_BEHAVIOR_CATEGORIES = {
  PURCHASE: [
    'Engaged shoppers',
    'Online shoppers',
    'Frequent online purchasers',
    'Premium purchasers'
  ],
  DEVICE: [
    'Mobile device users',
    'Desktop users',
    'Tablet users',
    'iOS users',
    'Android users'
  ],
  TRAVEL: [
    'Frequent travelers',
    'Business travelers',
    'Commuters',
    'Recently returned from trip'
  ],
  DIGITAL: [
    'Technology early adopters',
    'Small business owners',
    'IT decision makers',
    'Digital activities'
  ],
  BUSINESS: [
    'Business decision makers',
    'Small business owners',
    'IT professionals',
    'Marketing professionals'
  ]
} as const

// ============================================================================
// Meta Targeting Generator Class
// ============================================================================

export class MetaTargetingGenerator {
  /**
   * Generate complete Meta Ads targeting recommendations
   * Requirement 2.1: Generate Meta Ads audience recommendations
   */
  async generateTargeting(input: MetaTargetingInput): Promise<MetaTargeting> {
    // Extract demographics
    const demographics = this.generateDemographicTargeting(
      input.websiteAnalysis,
      input.targetLocation
    )

    // Extract interests
    const interests = this.generateInterestTargeting(
      input.websiteAnalysis,
      input.businessClassification,
      input.competitorAnalyses
    )

    // Extract behaviors
    const behaviors = this.generateBehaviorTargeting(
      input.websiteAnalysis,
      input.businessClassification
    )

    // Generate custom audience recommendations
    const customAudiences = this.generateCustomAudienceRecommendations(
      input.websiteAnalysis
    )

    // Generate lookalike audience suggestions
    const lookalikeSuggestions = this.generateLookalikeAudienceSuggestions(
      input.websiteAnalysis
    )

    return {
      demographics,
      interests,
      behaviors,
      custom_audiences: customAudiences,
      lookalike_suggestions: lookalikeSuggestions
    }
  }

  /**
   * Generate demographic targeting parameters
   * Requirement 2.1: Demographics extraction
   */
  private generateDemographicTargeting(
    websiteAnalysis: WebsiteAnalysis,
    targetLocation?: string
  ): DemographicTargeting {
    const demographics: DemographicTargeting = {}
    const audienceInsights = websiteAnalysis.target_audience

    // Age targeting based on business model and content
    const ageRange = this.inferAgeRange(websiteAnalysis)
    if (ageRange) {
      demographics.age_min = ageRange.min
      demographics.age_max = ageRange.max
    }

    // Gender targeting (default to all unless specific indicators)
    const genders = this.inferGenders(websiteAnalysis)
    if (genders.length > 0 && genders.length < 3) {
      demographics.genders = genders
    }

    // Location targeting
    if (targetLocation) {
      demographics.locations = this.parseLocationTargeting(targetLocation)
    } else if (audienceInsights?.demographics?.locations) {
      demographics.locations = audienceInsights.demographics.locations.map(loc => ({
        type: 'country',
        name: loc
      }))
    }

    // Language targeting
    demographics.languages = ['en'] // Default to English, can be enhanced

    // Education level targeting
    if (audienceInsights?.demographics?.education_levels) {
      demographics.education_levels = audienceInsights.demographics.education_levels
    } else {
      demographics.education_levels = this.inferEducationLevels(websiteAnalysis)
    }

    // Job title targeting
    if (audienceInsights?.demographics?.job_titles) {
      demographics.job_titles = audienceInsights.demographics.job_titles
    }

    return demographics
  }

  /**
   * Generate interest targeting recommendations
   * Requirement 2.1: Interests extraction
   */
  private generateInterestTargeting(
    websiteAnalysis: WebsiteAnalysis,
    businessClassification?: BusinessModelClassification,
    competitorAnalyses?: CompetitorAnalysis[]
  ): InterestTargeting[] {
    const interestTargets: InterestTargeting[] = []
    const businessModel = websiteAnalysis.business_model || 
                         businessClassification?.businessModel.type

    // Map business model to interest categories
    const primaryCategories = this.mapBusinessModelToInterests(businessModel)

    // Extract interests from content themes
    const contentInterests = this.extractInterestsFromContent(websiteAnalysis)

    // Extract interests from audience insights
    const audienceInterests = this.extractInterestsFromAudience(
      websiteAnalysis.target_audience
    )

    // Combine and deduplicate interests
    const allInterests = new Map<string, string[]>()

    // Add primary category interests
    primaryCategories.forEach(category => {
      const interests = this.getInterestsForCategory(category)
      if (interests.length > 0) {
        allInterests.set(category, interests)
      }
    })

    // Add content-based interests
    contentInterests.forEach(({ category, interests }) => {
      if (allInterests.has(category)) {
        const existing = allInterests.get(category)!
        allInterests.set(category, [...new Set([...existing, ...interests])])
      } else {
        allInterests.set(category, interests)
      }
    })

    // Add audience-based interests
    audienceInterests.forEach(({ category, interests }) => {
      if (allInterests.has(category)) {
        const existing = allInterests.get(category)!
        allInterests.set(category, [...new Set([...existing, ...interests])])
      } else {
        allInterests.set(category, interests)
      }
    })

    // Convert to InterestTargeting objects with confidence scores
    allInterests.forEach((interests, category) => {
      const confidence = this.calculateInterestConfidence(
        category,
        interests,
        websiteAnalysis,
        competitorAnalyses
      )

      const reasoning = this.generateInterestReasoning(
        category,
        interests,
        websiteAnalysis
      )

      interestTargets.push({
        category,
        interests: interests.slice(0, 10), // Limit to top 10 per category
        confidence,
        reasoning
      })
    })

    // Sort by confidence and return top categories
    return interestTargets
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  /**
   * Generate behavior targeting recommendations
   * Requirement 2.1: Behaviors extraction
   */
  private generateBehaviorTargeting(
    websiteAnalysis: WebsiteAnalysis,
    businessClassification?: BusinessModelClassification
  ): BehaviorTargeting[] {
    const behaviorTargets: BehaviorTargeting[] = []
    const businessModel = websiteAnalysis.business_model || 
                         businessClassification?.businessModel.type

    // Map business model to behavior categories
    const behaviorCategories = this.mapBusinessModelToBehaviors(businessModel)

    behaviorCategories.forEach(category => {
      const behaviors = this.getBehaviorsForCategory(category)
      const confidence = this.calculateBehaviorConfidence(
        category,
        behaviors,
        websiteAnalysis
      )

      const reasoning = this.generateBehaviorReasoning(
        category,
        behaviors,
        websiteAnalysis
      )

      behaviorTargets.push({
        category,
        behaviors,
        confidence,
        reasoning
      })
    })

    // Add behaviors from audience insights
    if (websiteAnalysis.target_audience?.behaviors) {
      const audienceBehaviors = websiteAnalysis.target_audience.behaviors
      if (audienceBehaviors.length > 0) {
        behaviorTargets.push({
          category: 'Audience Behaviors',
          behaviors: audienceBehaviors,
          confidence: 0.75,
          reasoning: 'Identified from website content and audience analysis'
        })
      }
    }

    return behaviorTargets
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  /**
   * Generate custom audience recommendations
   */
  private generateCustomAudienceRecommendations(
    websiteAnalysis: WebsiteAnalysis
  ): CustomAudienceRecommendation[] {
    const recommendations: CustomAudienceRecommendation[] = []

    // Website visitors audience
    recommendations.push({
      type: 'website_visitors',
      description: 'People who visited your website in the last 30 days',
      estimated_size: undefined
    })

    // Engagement audience
    recommendations.push({
      type: 'engagement',
      description: 'People who engaged with your Facebook Page or Instagram profile',
      estimated_size: undefined
    })

    // Customer list audience (if applicable)
    const businessModel = websiteAnalysis.business_model
    if (businessModel && ['B2B SaaS', 'B2C SaaS', 'E-commerce', 'Service Business'].includes(businessModel)) {
      recommendations.push({
        type: 'customer_list',
        description: 'Upload your customer email list to create a custom audience',
        estimated_size: undefined
      })
    }

    return recommendations
  }

  /**
   * Generate lookalike audience suggestions
   */
  private generateLookalikeAudienceSuggestions(
    websiteAnalysis: WebsiteAnalysis
  ): LookalikeAudience[] {
    const suggestions: LookalikeAudience[] = []

    // 1% lookalike (most similar)
    suggestions.push({
      source: 'Website Visitors',
      percentage: 1,
      description: 'Most similar to your website visitors - highest quality, smallest reach'
    })

    // 3% lookalike (balanced)
    suggestions.push({
      source: 'Website Visitors',
      percentage: 3,
      description: 'Balanced similarity and reach - recommended starting point'
    })

    // 5% lookalike (broader reach)
    suggestions.push({
      source: 'Website Visitors',
      percentage: 5,
      description: 'Broader reach with good similarity - for scaling campaigns'
    })

    return suggestions
  }

  /**
   * Calculate confidence scores for targeting recommendations
   * Requirement 2.3: Confidence scoring algorithm
   */
  calculateConfidenceScores(
    targeting: MetaTargeting,
    websiteAnalysis: WebsiteAnalysis
  ): ConfidenceScore[] {
    const scores: ConfidenceScore[] = []

    // Demographics confidence
    const demographicsScore = this.calculateDemographicsConfidence(
      targeting.demographics,
      websiteAnalysis
    )
    scores.push({
      category: 'Demographics',
      score: demographicsScore.score,
      factors: demographicsScore.factors
    })

    // Interests confidence
    const avgInterestConfidence = targeting.interests.reduce(
      (sum, interest) => sum + interest.confidence,
      0
    ) / Math.max(targeting.interests.length, 1)
    
    scores.push({
      category: 'Interests',
      score: Math.round(avgInterestConfidence * 100) / 100,
      factors: [
        `${targeting.interests.length} interest categories identified`,
        'Based on business model and content analysis',
        'Aligned with Meta\'s interest taxonomy'
      ]
    })

    // Behaviors confidence
    const avgBehaviorConfidence = targeting.behaviors.reduce(
      (sum, behavior) => sum + behavior.confidence,
      0
    ) / Math.max(targeting.behaviors.length, 1)
    
    scores.push({
      category: 'Behaviors',
      score: Math.round(avgBehaviorConfidence * 100) / 100,
      factors: [
        `${targeting.behaviors.length} behavior categories identified`,
        'Mapped from business model',
        'Validated against audience insights'
      ]
    })

    // Overall targeting confidence
    const overallScore = (
      demographicsScore.score * 0.3 +
      avgInterestConfidence * 0.4 +
      avgBehaviorConfidence * 0.3
    )
    
    scores.push({
      category: 'Overall Targeting',
      score: Math.round(overallScore * 100) / 100,
      factors: [
        'Comprehensive audience profile created',
        'Multiple targeting dimensions covered',
        'Recommendations aligned with business goals'
      ]
    })

    return scores
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Infer age range from business model and content
   */
  private inferAgeRange(websiteAnalysis: WebsiteAnalysis): { min: number; max: number } | null {
    const businessModel = websiteAnalysis.business_model
    const text = websiteAnalysis.content_themes?.map(t => t.theme.toLowerCase()).join(' ') || ''

    // B2B typically targets older professionals
    if (businessModel?.includes('B2B')) {
      return { min: 25, max: 65 }
    }

    // Tech/SaaS typically targets younger to middle-aged
    if (businessModel?.includes('SaaS') || text.includes('technology')) {
      return { min: 22, max: 55 }
    }

    // E-commerce varies widely
    if (businessModel === 'E-commerce') {
      return { min: 18, max: 65 }
    }

    // Education/Training
    if (businessModel?.includes('Education')) {
      return { min: 18, max: 45 }
    }

    // Default broad range
    return { min: 18, max: 65 }
  }

  /**
   * Infer gender targeting from content
   */
  private inferGenders(websiteAnalysis: WebsiteAnalysis): string[] {
    // Default to all genders unless specific indicators found
    // This is a simplified approach - real implementation would use more sophisticated analysis
    return [] // Empty array means target all genders
  }

  /**
   * Parse location targeting from string
   */
  private parseLocationTargeting(location: string): LocationTargeting[] {
    // Simple parsing - can be enhanced with geocoding API
    return [{
      type: 'country',
      name: location
    }]
  }

  /**
   * Infer education levels from business model
   */
  private inferEducationLevels(websiteAnalysis: WebsiteAnalysis): string[] {
    const businessModel = websiteAnalysis.business_model

    if (businessModel?.includes('B2B') || businessModel?.includes('SaaS')) {
      return ['College graduate', 'Some college', 'Graduate degree']
    }

    if (businessModel?.includes('Professional Services') || businessModel?.includes('Consulting')) {
      return ['College graduate', 'Graduate degree']
    }

    // Default to broad education levels
    return []
  }

  /**
   * Map business model to interest categories
   */
  private mapBusinessModelToInterests(businessModel?: string | null): string[] {
    if (!businessModel) return ['BUSINESS', 'TECHNOLOGY']

    const mapping: Record<string, string[]> = {
      'B2B SaaS': ['BUSINESS', 'TECHNOLOGY'],
      'B2C SaaS': ['TECHNOLOGY', 'LIFESTYLE'],
      'E-commerce': ['SHOPPING', 'LIFESTYLE'],
      'Marketplace': ['SHOPPING', 'BUSINESS'],
      'Service Business': ['BUSINESS', 'LIFESTYLE'],
      'Agency': ['BUSINESS', 'TECHNOLOGY'],
      'Consulting': ['BUSINESS', 'FINANCE'],
      'Education/Training': ['EDUCATION', 'BUSINESS'],
      'Healthcare': ['HEALTH', 'LIFESTYLE'],
      'Real Estate': ['FINANCE', 'LIFESTYLE'],
      'Financial Services': ['FINANCE', 'BUSINESS']
    }

    return mapping[businessModel] || ['BUSINESS']
  }

  /**
   * Get interests for a category
   */
  private getInterestsForCategory(category: string): string[] {
    const categoryKey = category as keyof typeof META_INTEREST_CATEGORIES
    return META_INTEREST_CATEGORIES[categoryKey] || []
  }

  /**
   * Extract interests from content themes
   */
  private extractInterestsFromContent(
    websiteAnalysis: WebsiteAnalysis
  ): Array<{ category: string; interests: string[] }> {
    const results: Array<{ category: string; interests: string[] }> = []
    const themes = websiteAnalysis.content_themes || []

    themes.forEach(theme => {
      const themeName = theme.theme.toLowerCase()
      
      // Map theme to interest category
      if (themeName.includes('tech') || themeName.includes('innovation')) {
        results.push({
          category: 'TECHNOLOGY',
          interests: ['Technology', 'Innovation', 'Software']
        })
      }
      
      if (themeName.includes('business') || themeName.includes('growth')) {
        results.push({
          category: 'BUSINESS',
          interests: ['Business and industry', 'Entrepreneurship', 'Business management']
        })
      }
      
      if (themeName.includes('health') || themeName.includes('wellness')) {
        results.push({
          category: 'HEALTH',
          interests: ['Health and wellness', 'Fitness and wellness']
        })
      }
    })

    return results
  }

  /**
   * Extract interests from audience insights
   */
  private extractInterestsFromAudience(
    audienceInsights?: AudienceInsights | null
  ): Array<{ category: string; interests: string[] }> {
    const results: Array<{ category: string; interests: string[] }> = []
    
    if (!audienceInsights?.psychographics?.interests) {
      return results
    }

    const interests = audienceInsights.psychographics.interests

    // Map audience interests to Meta categories
    interests.forEach(interest => {
      const lower = interest.toLowerCase()
      
      if (['technology', 'software', 'tech'].some(t => lower.includes(t))) {
        results.push({
          category: 'TECHNOLOGY',
          interests: [interest]
        })
      } else if (['business', 'marketing', 'sales'].some(t => lower.includes(t))) {
        results.push({
          category: 'BUSINESS',
          interests: [interest]
        })
      } else if (['shopping', 'fashion', 'retail'].some(t => lower.includes(t))) {
        results.push({
          category: 'SHOPPING',
          interests: [interest]
        })
      }
    })

    return results
  }

  /**
   * Calculate interest confidence score
   * Requirement 2.3: Confidence scoring
   */
  private calculateInterestConfidence(
    category: string,
    interests: string[],
    websiteAnalysis: WebsiteAnalysis,
    competitorAnalyses?: CompetitorAnalysis[]
  ): number {
    let confidence = 0.5 // Base confidence

    // More interests = higher confidence
    if (interests.length >= 5) confidence += 0.2
    else if (interests.length >= 3) confidence += 0.1

    // Business model alignment
    const businessModel = websiteAnalysis.business_model
    const expectedCategories = this.mapBusinessModelToInterests(businessModel)
    if (expectedCategories.includes(category)) {
      confidence += 0.2
    }

    // Content theme alignment
    const themes = websiteAnalysis.content_themes || []
    const hasRelevantTheme = themes.some(theme => 
      theme.theme.toLowerCase().includes(category.toLowerCase())
    )
    if (hasRelevantTheme) {
      confidence += 0.1
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Generate reasoning for interest targeting
   */
  private generateInterestReasoning(
    category: string,
    interests: string[],
    websiteAnalysis: WebsiteAnalysis
  ): string {
    const businessModel = websiteAnalysis.business_model || 'your business'
    
    return `Based on ${businessModel} model and content analysis, targeting ${category.toLowerCase()} interests (${interests.slice(0, 3).join(', ')}) aligns with your target audience's likely interests and behaviors.`
  }

  /**
   * Map business model to behavior categories
   */
  private mapBusinessModelToBehaviors(businessModel?: string | null): string[] {
    if (!businessModel) return ['DIGITAL', 'PURCHASE']

    const mapping: Record<string, string[]> = {
      'B2B SaaS': ['BUSINESS', 'DIGITAL'],
      'B2C SaaS': ['DIGITAL', 'DEVICE'],
      'E-commerce': ['PURCHASE', 'DIGITAL'],
      'Service Business': ['BUSINESS', 'DIGITAL'],
      'Agency': ['BUSINESS', 'DIGITAL'],
      'Consulting': ['BUSINESS'],
      'Education/Training': ['DIGITAL'],
      'Travel': ['TRAVEL']
    }

    return mapping[businessModel] || ['DIGITAL']
  }

  /**
   * Get behaviors for a category
   */
  private getBehaviorsForCategory(category: string): string[] {
    const categoryKey = category as keyof typeof META_BEHAVIOR_CATEGORIES
    return META_BEHAVIOR_CATEGORIES[categoryKey] || []
  }

  /**
   * Calculate behavior confidence score
   * Requirement 2.3: Confidence scoring
   */
  private calculateBehaviorConfidence(
    category: string,
    behaviors: string[],
    websiteAnalysis: WebsiteAnalysis
  ): number {
    let confidence = 0.6 // Base confidence for behaviors

    // Business model alignment
    const businessModel = websiteAnalysis.business_model
    const expectedCategories = this.mapBusinessModelToBehaviors(businessModel)
    if (expectedCategories.includes(category)) {
      confidence += 0.2
    }

    // More behaviors = slightly higher confidence
    if (behaviors.length >= 3) {
      confidence += 0.1
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Generate reasoning for behavior targeting
   */
  private generateBehaviorReasoning(
    category: string,
    behaviors: string[],
    websiteAnalysis: WebsiteAnalysis
  ): string {
    const businessModel = websiteAnalysis.business_model || 'your business'
    
    return `${businessModel} typically attracts users with ${category.toLowerCase()} behaviors. Targeting ${behaviors.slice(0, 2).join(' and ')} will help reach your ideal customers.`
  }

  /**
   * Calculate demographics confidence
   * Requirement 2.3: Confidence scoring
   */
  private calculateDemographicsConfidence(
    demographics: DemographicTargeting,
    websiteAnalysis: WebsiteAnalysis
  ): { score: number; factors: string[] } {
    let score = 0.5 // Base score
    const factors: string[] = []

    // Age range specified
    if (demographics.age_min && demographics.age_max) {
      score += 0.15
      factors.push(`Age range ${demographics.age_min}-${demographics.age_max} inferred from business model`)
    }

    // Location specified
    if (demographics.locations && demographics.locations.length > 0) {
      score += 0.15
      factors.push(`Geographic targeting: ${demographics.locations.map(l => l.name).join(', ')}`)
    }

    // Education levels specified
    if (demographics.education_levels && demographics.education_levels.length > 0) {
      score += 0.1
      factors.push(`Education levels aligned with ${websiteAnalysis.business_model || 'business model'}`)
    }

    // Job titles specified
    if (demographics.job_titles && demographics.job_titles.length > 0) {
      score += 0.1
      factors.push(`${demographics.job_titles.length} relevant job titles identified`)
    }

    return {
      score: Math.min(score, 1.0),
      factors
    }
  }
}

// Export singleton instance
export const metaTargetingGenerator = new MetaTargetingGenerator()
