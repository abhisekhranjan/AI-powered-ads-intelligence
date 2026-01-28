/**
 * Business Model Classifier Service
 * AI-powered business model detection, value proposition extraction, and audience signal identification
 * Requirements: 1.2
 */

import { BusinessModel, ValueProposition, AudienceInsights, ContentTheme } from '../models/types.js'

// ============================================================================
// Business Model Types and Constants
// ============================================================================

export const BUSINESS_MODEL_TYPES = [
  'B2B SaaS',
  'B2C SaaS',
  'E-commerce',
  'Marketplace',
  'Service Business',
  'Agency',
  'Consulting',
  'Education/Training',
  'Content/Media',
  'Non-profit',
  'Healthcare',
  'Real Estate',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Hospitality',
  'Professional Services',
  'Technology Product',
  'Subscription Service',
  'Freemium Model'
] as const

export type BusinessModelType = typeof BUSINESS_MODEL_TYPES[number]

// ============================================================================
// Content Analysis Input
// ============================================================================

export interface WebsiteContent {
  url: string
  title?: string
  description?: string
  headings: string[]
  paragraphs: string[]
  ctaButtons: string[]
  navigationLinks: string[]
  metadata?: {
    keywords?: string[]
    ogTags?: Record<string, string>
  }
}

// ============================================================================
// Business Model Classification Result
// ============================================================================

export interface BusinessModelClassification {
  businessModel: BusinessModel
  valuePropositions: ValueProposition[]
  audienceSignals: AudienceInsights
  contentThemes: ContentTheme[]
  confidence: number
}

// ============================================================================
// Business Model Classifier Class
// ============================================================================

export class BusinessModelClassifier {
  /**
   * Classify business model from website content
   */
  async classifyBusinessModel(content: WebsiteContent): Promise<BusinessModelClassification> {
    // Extract all text content for analysis
    const allText = this.extractAllText(content)
    
    // Detect business model
    const businessModel = this.detectBusinessModel(content, allText)
    
    // Extract value propositions
    const valuePropositions = this.extractValuePropositions(content, allText)
    
    // Identify audience signals
    const audienceSignals = this.identifyAudienceSignals(content, allText)
    
    // Extract content themes
    const contentThemes = this.extractContentThemes(content, allText)
    
    // Calculate overall confidence
    const confidence = this.calculateConfidence(businessModel, valuePropositions, audienceSignals)
    
    return {
      businessModel,
      valuePropositions,
      audienceSignals,
      contentThemes,
      confidence
    }
  }

  /**
   * Extract all text content from website
   */
  private extractAllText(content: WebsiteContent): string {
    const parts: string[] = [
      content.title || '',
      content.description || '',
      ...content.headings,
      ...content.paragraphs,
      ...content.ctaButtons,
      ...content.navigationLinks
    ]
    
    return parts.join(' ').toLowerCase()
  }

  /**
   * Detect business model type using pattern matching and keyword analysis
   */
  private detectBusinessModel(content: WebsiteContent, allText: string): BusinessModel {
    const scores: Record<string, number> = {}
    
    // Initialize scores
    BUSINESS_MODEL_TYPES.forEach(type => {
      scores[type] = 0
    })
    
    // B2B SaaS indicators
    if (this.containsAny(allText, ['enterprise', 'teams', 'api', 'integration', 'workflow', 'automation', 'dashboard', 'analytics'])) {
      scores['B2B SaaS'] += 3
    }
    if (this.containsAny(allText, ['pricing plans', 'free trial', 'demo', 'schedule a call'])) {
      scores['B2B SaaS'] += 2
    }
    
    // B2C SaaS indicators
    if (this.containsAny(allText, ['sign up free', 'get started', 'personal', 'individual', 'subscription'])) {
      scores['B2C SaaS'] += 2
    }
    if (this.containsAny(allText, ['mobile app', 'download', 'ios', 'android'])) {
      scores['B2C SaaS'] += 2
    }
    
    // E-commerce indicators
    if (this.containsAny(allText, ['shop', 'cart', 'checkout', 'add to cart', 'buy now', 'products', 'shipping'])) {
      scores['E-commerce'] += 4
    }
    if (this.containsAny(allText, ['free shipping', 'returns', 'warranty'])) {
      scores['E-commerce'] += 2
    }
    
    // Marketplace indicators
    if (this.containsAny(allText, ['sellers', 'buyers', 'marketplace', 'vendors', 'merchants'])) {
      scores['Marketplace'] += 4
    }
    if (this.containsAny(allText, ['list your', 'become a seller', 'join as'])) {
      scores['Marketplace'] += 2
    }
    
    // Service Business indicators
    if (this.containsAny(allText, ['services', 'book appointment', 'schedule', 'consultation', 'contact us'])) {
      scores['Service Business'] += 3
    }
    if (this.containsAny(allText, ['local', 'near you', 'service area', 'locations'])) {
      scores['Service Business'] += 2
    }
    
    // Agency indicators
    if (this.containsAny(allText, ['agency', 'clients', 'portfolio', 'case studies', 'projects'])) {
      scores['Agency'] += 4
    }
    if (this.containsAny(allText, ['creative', 'design', 'marketing', 'branding', 'digital'])) {
      scores['Agency'] += 2
    }
    
    // Consulting indicators
    if (this.containsAny(allText, ['consulting', 'consultant', 'advisory', 'strategy', 'expertise'])) {
      scores['Consulting'] += 4
    }
    if (this.containsAny(allText, ['years of experience', 'certified', 'expert'])) {
      scores['Consulting'] += 2
    }
    
    // Education/Training indicators
    if (this.containsAny(allText, ['courses', 'training', 'learn', 'education', 'certification', 'students'])) {
      scores['Education/Training'] += 4
    }
    if (this.containsAny(allText, ['enroll', 'curriculum', 'instructor', 'lessons'])) {
      scores['Education/Training'] += 2
    }
    
    // Content/Media indicators
    if (this.containsAny(allText, ['blog', 'articles', 'news', 'stories', 'content', 'media'])) {
      scores['Content/Media'] += 3
    }
    if (this.containsAny(allText, ['subscribe', 'newsletter', 'latest', 'trending'])) {
      scores['Content/Media'] += 2
    }
    
    // Healthcare indicators
    if (this.containsAny(allText, ['health', 'medical', 'doctor', 'patient', 'clinic', 'hospital', 'treatment'])) {
      scores['Healthcare'] += 4
    }
    if (this.containsAny(allText, ['appointment', 'insurance', 'care'])) {
      scores['Healthcare'] += 2
    }
    
    // Real Estate indicators
    if (this.containsAny(allText, ['property', 'real estate', 'homes', 'apartments', 'rent', 'buy', 'lease'])) {
      scores['Real Estate'] += 4
    }
    if (this.containsAny(allText, ['listings', 'agents', 'mortgage', 'square feet'])) {
      scores['Real Estate'] += 2
    }
    
    // Financial Services indicators
    if (this.containsAny(allText, ['financial', 'investment', 'banking', 'insurance', 'loans', 'credit'])) {
      scores['Financial Services'] += 4
    }
    if (this.containsAny(allText, ['rates', 'apr', 'secure', 'fdic'])) {
      scores['Financial Services'] += 2
    }
    
    // Professional Services indicators
    if (this.containsAny(allText, ['legal', 'accounting', 'law', 'attorney', 'cpa', 'professional'])) {
      scores['Professional Services'] += 4
    }
    
    // Subscription Service indicators
    if (this.containsAny(allText, ['monthly', 'annual', 'subscription', 'membership', 'recurring'])) {
      scores['Subscription Service'] += 3
    }
    
    // Freemium Model indicators
    if (this.containsAny(allText, ['free forever', 'upgrade', 'premium features', 'pro plan'])) {
      scores['Freemium Model'] += 3
    }
    
    // Find the highest scoring business model
    let maxScore = 0
    let detectedType: BusinessModelType = 'Service Business' // Default
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score
        detectedType = type as BusinessModelType
      }
    }
    
    // Calculate confidence based on score
    const confidence = Math.min(maxScore / 10, 1.0)
    
    return {
      type: detectedType,
      description: this.getBusinessModelDescription(detectedType),
      confidence
    }
  }

  /**
   * Extract value propositions from content
   */
  private extractValuePropositions(content: WebsiteContent, allText: string): ValueProposition[] {
    const propositions: ValueProposition[] = []
    
    // Analyze headings for value propositions (usually in H1, H2)
    const mainHeadings = content.headings.slice(0, 5) // Focus on top headings
    
    for (const heading of mainHeadings) {
      const category = this.categorizeValueProposition(heading)
      const strength = this.calculatePropositionStrength(heading, allText)
      
      if (strength > 0.3) { // Only include strong propositions
        propositions.push({
          proposition: heading,
          category,
          strength
        })
      }
    }
    
    // Analyze CTA buttons for value propositions
    for (const cta of content.ctaButtons) {
      if (this.isValueProposition(cta)) {
        propositions.push({
          proposition: cta,
          category: 'action',
          strength: 0.7
        })
      }
    }
    
    // Analyze description/meta description
    if (content.description && content.description.length > 20) {
      propositions.push({
        proposition: content.description,
        category: 'overview',
        strength: 0.8
      })
    }
    
    // Sort by strength and return top 5
    return propositions
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
  }

  /**
   * Identify audience signals from content
   */
  private identifyAudienceSignals(content: WebsiteContent, allText: string): AudienceInsights {
    const insights: AudienceInsights = {
      demographics: {},
      psychographics: {},
      pain_points: [],
      goals: [],
      behaviors: []
    }
    
    // Identify job titles and roles
    const jobTitles = this.extractJobTitles(allText)
    if (jobTitles.length > 0) {
      insights.demographics!.job_titles = jobTitles
    }
    
    // Identify pain points (problems the business solves)
    insights.pain_points = this.extractPainPoints(content, allText)
    
    // Identify goals (what customers want to achieve)
    insights.goals = this.extractGoals(content, allText)
    
    // Identify behaviors (what customers do)
    insights.behaviors = this.extractBehaviors(allText)
    
    // Identify interests
    const interests = this.extractInterests(allText)
    if (interests.length > 0) {
      insights.psychographics!.interests = interests
    }
    
    return insights
  }

  /**
   * Extract content themes
   */
  private extractContentThemes(content: WebsiteContent, allText: string): ContentTheme[] {
    const themes: ContentTheme[] = []
    const themeKeywords: Record<string, string[]> = {
      'Innovation': ['innovative', 'cutting-edge', 'advanced', 'modern', 'technology', 'future'],
      'Trust & Security': ['secure', 'trusted', 'reliable', 'safe', 'protected', 'privacy'],
      'Ease of Use': ['easy', 'simple', 'intuitive', 'user-friendly', 'straightforward', 'effortless'],
      'Performance': ['fast', 'efficient', 'powerful', 'optimized', 'performance', 'speed'],
      'Support': ['support', 'help', 'assistance', 'customer service', '24/7', 'dedicated'],
      'Value': ['affordable', 'value', 'roi', 'cost-effective', 'savings', 'investment'],
      'Quality': ['quality', 'premium', 'professional', 'excellence', 'best', 'top-rated'],
      'Growth': ['grow', 'scale', 'increase', 'boost', 'improve', 'enhance'],
      'Collaboration': ['team', 'collaborate', 'together', 'share', 'communication', 'workflow'],
      'Customization': ['custom', 'flexible', 'personalized', 'tailored', 'configurable', 'adaptable']
    }
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matchedKeywords: string[] = []
      let frequency = 0
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = allText.match(regex)
        if (matches) {
          matchedKeywords.push(keyword)
          frequency += matches.length
        }
      }
      
      if (matchedKeywords.length > 0) {
        const relevanceScore = (matchedKeywords.length / keywords.length) * (frequency / 10)
        themes.push({
          theme,
          keywords: matchedKeywords,
          frequency,
          relevance_score: Math.min(relevanceScore, 1.0)
        })
      }
    }
    
    // Sort by relevance and return top 5
    return themes
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 5)
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()))
  }

  private getBusinessModelDescription(type: BusinessModelType): string {
    const descriptions: Record<BusinessModelType, string> = {
      'B2B SaaS': 'Software-as-a-Service targeting business customers',
      'B2C SaaS': 'Software-as-a-Service targeting individual consumers',
      'E-commerce': 'Online retail selling physical or digital products',
      'Marketplace': 'Platform connecting buyers and sellers',
      'Service Business': 'Local or professional service provider',
      'Agency': 'Creative or marketing agency serving clients',
      'Consulting': 'Professional consulting and advisory services',
      'Education/Training': 'Educational courses and training programs',
      'Content/Media': 'Content creation and media publishing',
      'Non-profit': 'Non-profit organization or charity',
      'Healthcare': 'Healthcare services and medical practice',
      'Real Estate': 'Real estate sales, rentals, or property management',
      'Financial Services': 'Banking, investment, or financial products',
      'Manufacturing': 'Product manufacturing and distribution',
      'Retail': 'Physical or online retail store',
      'Hospitality': 'Hotels, restaurants, or hospitality services',
      'Professional Services': 'Legal, accounting, or professional services',
      'Technology Product': 'Technology hardware or software products',
      'Subscription Service': 'Recurring subscription-based service',
      'Freemium Model': 'Free basic service with premium upgrades'
    }
    
    return descriptions[type]
  }

  private categorizeValueProposition(text: string): string {
    const lower = text.toLowerCase()
    
    if (this.containsAny(lower, ['save', 'reduce', 'cut', 'lower', 'decrease'])) {
      return 'cost_savings'
    }
    if (this.containsAny(lower, ['fast', 'quick', 'instant', 'speed', 'rapid'])) {
      return 'speed'
    }
    if (this.containsAny(lower, ['easy', 'simple', 'effortless', 'intuitive'])) {
      return 'ease_of_use'
    }
    if (this.containsAny(lower, ['best', 'top', 'leading', 'premium', 'quality'])) {
      return 'quality'
    }
    if (this.containsAny(lower, ['grow', 'increase', 'boost', 'improve', 'enhance'])) {
      return 'growth'
    }
    if (this.containsAny(lower, ['secure', 'safe', 'protected', 'trusted'])) {
      return 'security'
    }
    
    return 'general'
  }

  private calculatePropositionStrength(proposition: string, allText: string): number {
    let strength = 0.5 // Base strength
    
    // Longer propositions are usually more specific and valuable
    if (proposition.length > 50) strength += 0.2
    
    // Contains numbers or specific claims
    if (/\d+/.test(proposition)) strength += 0.1
    
    // Contains power words
    const powerWords = ['guaranteed', 'proven', 'certified', 'award', 'best', 'leading', 'trusted']
    if (this.containsAny(proposition.toLowerCase(), powerWords)) strength += 0.2
    
    return Math.min(strength, 1.0)
  }

  private isValueProposition(text: string): boolean {
    const lower = text.toLowerCase()
    // CTAs that indicate value
    return this.containsAny(lower, [
      'get started', 'try free', 'learn more', 'see how',
      'discover', 'explore', 'start now', 'join'
    ])
  }

  private extractJobTitles(text: string): string[] {
    const jobTitles: string[] = []
    const commonTitles = [
      'ceo', 'cto', 'cfo', 'cmo', 'manager', 'director', 'executive',
      'founder', 'owner', 'entrepreneur', 'developer', 'designer',
      'marketer', 'analyst', 'consultant', 'specialist', 'engineer',
      'coordinator', 'administrator', 'professional'
    ]
    
    for (const title of commonTitles) {
      if (text.includes(title)) {
        jobTitles.push(title)
      }
    }
    
    return jobTitles.slice(0, 5)
  }

  private extractPainPoints(content: WebsiteContent, allText: string): string[] {
    const painPoints: string[] = []
    const painIndicators = [
      'struggling with', 'tired of', 'frustrated by', 'problem with',
      'challenge', 'difficulty', 'issue', 'pain', 'waste', 'lose'
    ]
    
    // Look for pain point patterns in paragraphs
    for (const paragraph of content.paragraphs) {
      const lower = paragraph.toLowerCase()
      for (const indicator of painIndicators) {
        if (lower.includes(indicator)) {
          painPoints.push(paragraph.substring(0, 100)) // First 100 chars
          break
        }
      }
    }
    
    return painPoints.slice(0, 3)
  }

  private extractGoals(content: WebsiteContent, allText: string): string[] {
    const goals: string[] = []
    const goalIndicators = [
      'achieve', 'reach', 'accomplish', 'attain', 'succeed',
      'grow', 'increase', 'improve', 'enhance', 'optimize'
    ]
    
    for (const heading of content.headings) {
      const lower = heading.toLowerCase()
      for (const indicator of goalIndicators) {
        if (lower.includes(indicator)) {
          goals.push(heading)
          break
        }
      }
    }
    
    return goals.slice(0, 3)
  }

  private extractBehaviors(text: string): string[] {
    const behaviors: string[] = []
    const behaviorPatterns = [
      'online shopping', 'social media', 'mobile users', 'frequent travelers',
      'early adopters', 'tech-savvy', 'budget-conscious', 'quality-focused',
      'time-sensitive', 'research-oriented', 'brand-loyal', 'price-sensitive'
    ]
    
    for (const pattern of behaviorPatterns) {
      if (text.includes(pattern)) {
        behaviors.push(pattern)
      }
    }
    
    return behaviors.slice(0, 5)
  }

  private extractInterests(text: string): string[] {
    const interests: string[] = []
    const interestCategories = [
      'technology', 'business', 'marketing', 'design', 'finance',
      'health', 'fitness', 'travel', 'education', 'entertainment',
      'sports', 'fashion', 'food', 'music', 'art'
    ]
    
    for (const interest of interestCategories) {
      if (text.includes(interest)) {
        interests.push(interest)
      }
    }
    
    return interests.slice(0, 5)
  }

  private calculateConfidence(
    businessModel: BusinessModel,
    valuePropositions: ValueProposition[],
    audienceSignals: AudienceInsights
  ): number {
    let confidence = businessModel.confidence * 0.4 // 40% weight on business model
    
    // Add confidence from value propositions (30% weight)
    if (valuePropositions.length > 0) {
      const avgStrength = valuePropositions.reduce((sum, vp) => sum + vp.strength, 0) / valuePropositions.length
      confidence += avgStrength * 0.3
    }
    
    // Add confidence from audience signals (30% weight)
    let signalCount = 0
    if (audienceSignals.pain_points && audienceSignals.pain_points.length > 0) signalCount++
    if (audienceSignals.goals && audienceSignals.goals.length > 0) signalCount++
    if (audienceSignals.behaviors && audienceSignals.behaviors.length > 0) signalCount++
    if (audienceSignals.demographics?.job_titles && audienceSignals.demographics.job_titles.length > 0) signalCount++
    
    confidence += (signalCount / 4) * 0.3
    
    return Math.min(confidence, 1.0)
  }
}

// Export singleton instance
export const businessModelClassifier = new BusinessModelClassifier()
