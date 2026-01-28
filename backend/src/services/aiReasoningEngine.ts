/**
 * AI Reasoning Engine Service
 * 
 * Integrates OpenAI GPT-4 for intelligent analysis and reasoning tasks.
 * Provides prompt templates for various analysis scenarios and validates responses.
 * 
 * Requirements: 2.1, 2.2, 2.4
 */

import OpenAI from 'openai'
import { config } from '../config/env.js'
import { logger } from '../config/logger.js'
import {
  BusinessModel,
  ValueProposition,
  AudienceInsights,
  ContentTheme
} from '../models/types.js'

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface AIAnalysisRequest {
  websiteContent: {
    url: string
    title?: string
    description?: string
    text: string
    headings: string[]
    businessModel?: BusinessModel
    valuePropositions?: ValueProposition[]
  }
  analysisType: 'business_model' | 'audience_insights' | 'value_propositions' | 'content_themes' | 'targeting_recommendations'
  context?: Record<string, any>
}

export interface AIAnalysisResponse {
  success: boolean
  data: any
  reasoning?: string
  confidence: number
  tokensUsed?: number
  error?: string
}

export interface MetaTargetingRecommendation {
  demographics: {
    age_ranges: string[]
    genders: string[]
    locations?: string[]
  }
  interests: Array<{
    category: string
    specific_interests: string[]
    reasoning: string
  }>
  behaviors: Array<{
    behavior: string
    reasoning: string
  }>
  custom_audiences: Array<{
    type: string
    description: string
    reasoning: string
  }>
  lookalike_suggestions: Array<{
    source: string
    percentage: number
    reasoning: string
  }>
}

export interface GoogleTargetingRecommendation {
  keyword_clusters: Array<{
    intent: string
    keywords: Array<{
      keyword: string
      match_type: 'exact' | 'phrase' | 'broad'
      estimated_volume: string
    }>
    reasoning: string
  }>
  audiences: Array<{
    type: string
    description: string
    reasoning: string
  }>
  demographics: {
    age_ranges: string[]
    genders: string[]
    household_income?: string[]
  }
  placements: Array<{
    type: string
    examples: string[]
    reasoning: string
  }>
}

// ============================================================================
// Prompt Templates
// ============================================================================

export class PromptTemplates {
  /**
   * Generate prompt for business model analysis
   */
  static businessModelAnalysis(websiteContent: any): string {
    return `Analyze the following website content and determine the business model.

Website URL: ${websiteContent.url}
Title: ${websiteContent.title || 'N/A'}
Description: ${websiteContent.description || 'N/A'}

Main Headings:
${websiteContent.headings.slice(0, 10).join('\n')}

Content Sample:
${websiteContent.text.substring(0, 2000)}

Based on this content, identify:
1. The primary business model (e.g., B2B SaaS, E-commerce, Service Business, etc.)
2. A clear description of how the business operates
3. Your confidence level (0-1) in this classification

Respond in JSON format:
{
  "type": "business model type",
  "description": "detailed description",
  "confidence": 0.85,
  "reasoning": "explanation of why you chose this classification"
}`
  }

  /**
   * Generate prompt for audience insights analysis
   */
  static audienceInsightsAnalysis(websiteContent: any): string {
    return `Analyze the following website content to identify target audience insights.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}
Title: ${websiteContent.title || 'N/A'}

Value Propositions:
${websiteContent.valuePropositions?.map((vp: ValueProposition) => `- ${vp.proposition}`).join('\n') || 'N/A'}

Content Sample:
${websiteContent.text.substring(0, 2000)}

Identify the target audience by analyzing:
1. Demographics (age, gender, location, job titles, income level)
2. Psychographics (interests, values, lifestyle)
3. Pain points (problems they're trying to solve)
4. Goals (what they want to achieve)
5. Behaviors (how they act, what they do online)

Respond in JSON format:
{
  "demographics": {
    "age_ranges": ["25-34", "35-44"],
    "genders": ["all", "male", "female"],
    "locations": ["United States", "Urban areas"],
    "job_titles": ["Marketing Manager", "Business Owner"],
    "income_level": "Middle to Upper income"
  },
  "psychographics": {
    "interests": ["Technology", "Business Growth", "Marketing"],
    "values": ["Innovation", "Efficiency", "Results"],
    "lifestyle": "Professional, busy, tech-savvy"
  },
  "pain_points": [
    "Struggling with inefficient processes",
    "Wasting time on manual tasks"
  ],
  "goals": [
    "Increase productivity",
    "Grow their business"
  ],
  "behaviors": [
    "Actively researching solutions online",
    "Comparing multiple options before purchasing"
  ],
  "reasoning": "explanation of your analysis"
}`
  }

  /**
   * Generate prompt for Meta Ads targeting recommendations
   */
  static metaTargetingRecommendations(websiteContent: any, audienceInsights: AudienceInsights): string {
    return `Generate Meta (Facebook/Instagram) Ads targeting recommendations for this business.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}

Value Propositions:
${websiteContent.valuePropositions?.map((vp: ValueProposition) => `- ${vp.proposition}`).join('\n') || 'N/A'}

Target Audience Insights:
Demographics: ${JSON.stringify(audienceInsights.demographics || {})}
Interests: ${JSON.stringify(audienceInsights.psychographics?.interests || [])}
Pain Points: ${JSON.stringify(audienceInsights.pain_points || [])}
Goals: ${JSON.stringify(audienceInsights.goals || [])}

Generate specific Meta Ads targeting recommendations including:
1. Demographics (age ranges, genders, locations)
2. Detailed interests (be specific with Meta's interest categories)
3. Behaviors (purchase behaviors, device usage, etc.)
4. Custom audience suggestions (website visitors, email lists, etc.)
5. Lookalike audience recommendations

For each recommendation, provide clear reasoning explaining WHY this targeting makes sense.

Respond in JSON format:
{
  "demographics": {
    "age_ranges": ["25-34", "35-44", "45-54"],
    "genders": ["all"],
    "locations": ["United States", "Canada", "United Kingdom"]
  },
  "interests": [
    {
      "category": "Business and Industry",
      "specific_interests": ["Small business", "Entrepreneurship", "Business management"],
      "reasoning": "These interests align with the target audience of business owners"
    }
  ],
  "behaviors": [
    {
      "behavior": "Small business owners",
      "reasoning": "Direct match with the target customer profile"
    }
  ],
  "custom_audiences": [
    {
      "type": "Website visitors (past 30 days)",
      "description": "People who visited the website but didn't convert",
      "reasoning": "Retarget warm leads who showed interest"
    }
  ],
  "lookalike_suggestions": [
    {
      "source": "Email list subscribers",
      "percentage": 1,
      "reasoning": "Find similar users to existing engaged audience"
    }
  ],
  "confidence_score": 0.85,
  "overall_reasoning": "Summary of the targeting strategy"
}`
  }

  /**
   * Generate prompt for Google Ads targeting recommendations
   */
  static googleTargetingRecommendations(websiteContent: any, audienceInsights: AudienceInsights): string {
    return `Generate Google Ads targeting recommendations for this business.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}

Value Propositions:
${websiteContent.valuePropositions?.map((vp: ValueProposition) => `- ${vp.proposition}`).join('\n') || 'N/A'}

Target Audience Insights:
Pain Points: ${JSON.stringify(audienceInsights.pain_points || [])}
Goals: ${JSON.stringify(audienceInsights.goals || [])}
Behaviors: ${JSON.stringify(audienceInsights.behaviors || [])}

Generate specific Google Ads targeting recommendations including:
1. Keyword clusters organized by user intent (not just syntax)
2. Match types for each keyword (exact, phrase, broad)
3. Estimated search volume categories (high, medium, low)
4. Audience targeting options (in-market, affinity, custom intent)
5. Demographic targeting
6. Placement recommendations for Display/YouTube

For each keyword cluster, explain the INTENT behind the search and why it matters.

Respond in JSON format:
{
  "keyword_clusters": [
    {
      "intent": "Problem-aware: Looking for solutions to specific pain point",
      "keywords": [
        {
          "keyword": "business management software",
          "match_type": "phrase",
          "estimated_volume": "high"
        }
      ],
      "reasoning": "Users searching these terms are actively looking for solutions"
    }
  ],
  "audiences": [
    {
      "type": "In-Market: Business Services",
      "description": "Users actively researching business software",
      "reasoning": "High intent audience ready to make purchase decisions"
    }
  ],
  "demographics": {
    "age_ranges": ["25-34", "35-44", "45-54"],
    "genders": ["all"],
    "household_income": ["top 30%", "top 40%"]
  },
  "placements": [
    {
      "type": "YouTube channels",
      "examples": ["Business education channels", "Entrepreneurship content"],
      "reasoning": "Reach audience where they consume relevant content"
    }
  ],
  "confidence_score": 0.85,
  "overall_reasoning": "Summary of the keyword and targeting strategy"
}`
  }

  /**
   * Generate prompt for value proposition extraction
   */
  static valuePropositionExtraction(websiteContent: any): string {
    return `Extract and analyze the value propositions from this website.

Website URL: ${websiteContent.url}
Title: ${websiteContent.title || 'N/A'}
Description: ${websiteContent.description || 'N/A'}

Main Headings:
${websiteContent.headings.slice(0, 15).join('\n')}

Content Sample:
${websiteContent.text.substring(0, 3000)}

Identify the key value propositions - the unique benefits and promises this business offers.
Categorize each proposition and rate its strength.

Respond in JSON format:
{
  "value_propositions": [
    {
      "proposition": "The actual value proposition text",
      "category": "speed|cost_savings|ease_of_use|quality|security|growth",
      "strength": 0.85,
      "reasoning": "Why this is a strong value proposition"
    }
  ],
  "primary_value": "The main value proposition in one sentence",
  "reasoning": "Overall analysis of the value propositions"
}`
  }

  /**
   * Generate prompt for content theme analysis
   */
  static contentThemeAnalysis(websiteContent: any): string {
    return `Analyze the content themes and messaging patterns on this website.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}

Content Sample:
${websiteContent.text.substring(0, 3000)}

Identify the main content themes and messaging patterns. Look for:
1. Recurring topics and subjects
2. Emotional appeals (trust, innovation, results, etc.)
3. Key messaging pillars
4. Brand personality traits

Respond in JSON format:
{
  "themes": [
    {
      "theme": "Innovation & Technology",
      "keywords": ["innovative", "cutting-edge", "advanced"],
      "frequency": 15,
      "relevance_score": 0.85,
      "reasoning": "Why this theme is important"
    }
  ],
  "messaging_tone": "professional|casual|technical|friendly",
  "brand_personality": ["innovative", "trustworthy", "results-driven"],
  "reasoning": "Overall content analysis"
}`
  }
}

// ============================================================================
// AI Reasoning Engine Service Class
// ============================================================================

export class AIReasoningEngine {
  private openai: OpenAI | null = null
  private readonly model = 'gpt-4-turbo-preview'
  private readonly maxTokens = 2000
  private readonly temperature = 0.7

  /**
   * Initialize OpenAI client
   */
  private initializeClient(): OpenAI {
    if (!this.openai) {
      if (!config.openai.apiKey) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.')
      }

      this.openai = new OpenAI({
        apiKey: config.openai.apiKey
      })

      logger.info('OpenAI client initialized')
    }

    return this.openai
  }

  /**
   * Execute AI analysis with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        logger.warn(`AI analysis attempt ${attempt} failed: ${lastError.message}`)

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }

    throw lastError || new Error('AI analysis failed after retries')
  }

  /**
   * Call OpenAI API with prompt
   */
  private async callOpenAI(prompt: string, systemMessage?: string): Promise<AIAnalysisResponse> {
    const client = this.initializeClient()

    try {
      logger.info('Calling OpenAI API...')

      const response = await this.executeWithRetry(async () => {
        return await client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemMessage || 'You are an expert marketing analyst specializing in digital advertising and audience targeting. Provide detailed, actionable insights based on website analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          response_format: { type: 'json_object' }
        })
      })

      const content = response.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response content from OpenAI')
      }

      // Parse JSON response
      const parsedData = JSON.parse(content)

      logger.info(`OpenAI API call successful. Tokens used: ${response.usage?.total_tokens || 0}`)

      return {
        success: true,
        data: parsedData,
        reasoning: parsedData.reasoning || parsedData.overall_reasoning,
        confidence: parsedData.confidence || parsedData.confidence_score || 0.8,
        tokensUsed: response.usage?.total_tokens
      }
    } catch (error) {
      logger.error('OpenAI API call failed:', error)

      return {
        success: false,
        data: null,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Analyze business model using AI
   * Requirement 2.1: AI-powered analysis
   */
  async analyzeBusinessModel(websiteContent: any): Promise<AIAnalysisResponse> {
    logger.info(`Analyzing business model for: ${websiteContent.url}`)

    const prompt = PromptTemplates.businessModelAnalysis(websiteContent)
    const response = await this.callOpenAI(prompt)

    if (response.success) {
      // Validate response structure
      const validated = this.validateBusinessModelResponse(response.data)
      return {
        ...response,
        data: validated
      }
    }

    return response
  }

  /**
   * Analyze audience insights using AI
   * Requirement 2.2: Audience analysis
   */
  async analyzeAudienceInsights(websiteContent: any): Promise<AIAnalysisResponse> {
    logger.info(`Analyzing audience insights for: ${websiteContent.url}`)

    const prompt = PromptTemplates.audienceInsightsAnalysis(websiteContent)
    const response = await this.callOpenAI(prompt)

    if (response.success) {
      // Validate response structure
      const validated = this.validateAudienceInsightsResponse(response.data)
      return {
        ...response,
        data: validated
      }
    }

    return response
  }

  /**
   * Generate Meta Ads targeting recommendations
   * Requirement 2.1: Meta targeting recommendations
   */
  async generateMetaTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights
  ): Promise<AIAnalysisResponse> {
    logger.info(`Generating Meta targeting recommendations for: ${websiteContent.url}`)

    const prompt = PromptTemplates.metaTargetingRecommendations(websiteContent, audienceInsights)
    const response = await this.callOpenAI(
      prompt,
      'You are an expert Meta Ads specialist. Generate specific, actionable targeting recommendations that comply with Meta advertising policies. Be detailed and provide clear reasoning for each recommendation.'
    )

    if (response.success) {
      // Validate response structure
      const validated = this.validateMetaTargetingResponse(response.data)
      return {
        ...response,
        data: validated
      }
    }

    return response
  }

  /**
   * Generate Google Ads targeting recommendations
   * Requirement 2.2: Google targeting recommendations
   */
  async generateGoogleTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights
  ): Promise<AIAnalysisResponse> {
    logger.info(`Generating Google targeting recommendations for: ${websiteContent.url}`)

    const prompt = PromptTemplates.googleTargetingRecommendations(websiteContent, audienceInsights)
    const response = await this.callOpenAI(
      prompt,
      'You are an expert Google Ads specialist. Generate specific keyword clusters organized by user intent, not just syntax. Provide actionable targeting recommendations that comply with Google advertising policies. Explain the reasoning behind each recommendation.'
    )

    if (response.success) {
      // Validate response structure
      const validated = this.validateGoogleTargetingResponse(response.data)
      return {
        ...response,
        data: validated
      }
    }

    return response
  }

  /**
   * Extract value propositions using AI
   * Requirement 2.4: Explanation generation
   */
  async extractValuePropositions(websiteContent: any): Promise<AIAnalysisResponse> {
    logger.info(`Extracting value propositions for: ${websiteContent.url}`)

    const prompt = PromptTemplates.valuePropositionExtraction(websiteContent)
    const response = await this.callOpenAI(prompt)

    if (response.success) {
      // Validate response structure
      const validated = this.validateValuePropositionsResponse(response.data)
      return {
        ...response,
        data: validated
      }
    }

    return response
  }

  /**
   * Analyze content themes using AI
   * Requirement 2.4: Content analysis
   */
  async analyzeContentThemes(websiteContent: any): Promise<AIAnalysisResponse> {
    logger.info(`Analyzing content themes for: ${websiteContent.url}`)

    const prompt = PromptTemplates.contentThemeAnalysis(websiteContent)
    const response = await this.callOpenAI(prompt)

    if (response.success) {
      // Validate response structure
      const validated = this.validateContentThemesResponse(response.data)
      return {
        ...response,
        data: validated
      }
    }

    return response
  }

  // ============================================================================
  // Response Validation Methods
  // ============================================================================

  /**
   * Validate business model response structure
   */
  private validateBusinessModelResponse(data: any): BusinessModel {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid business model response format')
    }

    return {
      type: data.type || 'Unknown',
      description: data.description || '',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0.5
    }
  }

  /**
   * Validate audience insights response structure
   */
  private validateAudienceInsightsResponse(data: any): AudienceInsights {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid audience insights response format')
    }

    return {
      demographics: data.demographics || {},
      psychographics: data.psychographics || {},
      pain_points: Array.isArray(data.pain_points) ? data.pain_points : [],
      goals: Array.isArray(data.goals) ? data.goals : [],
      behaviors: Array.isArray(data.behaviors) ? data.behaviors : []
    }
  }

  /**
   * Validate Meta targeting response structure
   */
  private validateMetaTargetingResponse(data: any): MetaTargetingRecommendation {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid Meta targeting response format')
    }

    return {
      demographics: {
        age_ranges: Array.isArray(data.demographics?.age_ranges) ? data.demographics.age_ranges : [],
        genders: Array.isArray(data.demographics?.genders) ? data.demographics.genders : ['all'],
        locations: Array.isArray(data.demographics?.locations) ? data.demographics.locations : []
      },
      interests: Array.isArray(data.interests) ? data.interests : [],
      behaviors: Array.isArray(data.behaviors) ? data.behaviors : [],
      custom_audiences: Array.isArray(data.custom_audiences) ? data.custom_audiences : [],
      lookalike_suggestions: Array.isArray(data.lookalike_suggestions) ? data.lookalike_suggestions : []
    }
  }

  /**
   * Validate Google targeting response structure
   */
  private validateGoogleTargetingResponse(data: any): GoogleTargetingRecommendation {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid Google targeting response format')
    }

    return {
      keyword_clusters: Array.isArray(data.keyword_clusters) ? data.keyword_clusters : [],
      audiences: Array.isArray(data.audiences) ? data.audiences : [],
      demographics: {
        age_ranges: Array.isArray(data.demographics?.age_ranges) ? data.demographics.age_ranges : [],
        genders: Array.isArray(data.demographics?.genders) ? data.demographics.genders : ['all'],
        household_income: Array.isArray(data.demographics?.household_income) ? data.demographics.household_income : []
      },
      placements: Array.isArray(data.placements) ? data.placements : []
    }
  }

  /**
   * Validate value propositions response structure
   */
  private validateValuePropositionsResponse(data: any): ValueProposition[] {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid value propositions response format')
    }

    const propositions = Array.isArray(data.value_propositions) ? data.value_propositions : []

    return propositions.map((vp: any) => ({
      proposition: vp.proposition || '',
      category: vp.category || 'general',
      strength: typeof vp.strength === 'number' ? vp.strength : 0.5
    }))
  }

  /**
   * Validate content themes response structure
   */
  private validateContentThemesResponse(data: any): ContentTheme[] {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid content themes response format')
    }

    const themes = Array.isArray(data.themes) ? data.themes : []

    return themes.map((theme: any) => ({
      theme: theme.theme || '',
      keywords: Array.isArray(theme.keywords) ? theme.keywords : [],
      frequency: typeof theme.frequency === 'number' ? theme.frequency : 0,
      relevance_score: typeof theme.relevance_score === 'number' ? theme.relevance_score : 0.5
    }))
  }

  /**
   * Check if OpenAI is configured and available
   */
  isConfigured(): boolean {
    return !!config.openai.apiKey
  }

  /**
   * Get current model information
   */
  getModelInfo(): { model: string; maxTokens: number; temperature: number } {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature
    }
  }
}

// Export singleton instance
export const aiReasoningEngine = new AIReasoningEngine()
