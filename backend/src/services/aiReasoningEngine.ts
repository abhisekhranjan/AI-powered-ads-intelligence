/**
 * AI Reasoning Engine Service
 * OpenRouter-compatible, production-safe
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
// Types
// ============================================================================

export interface AIAnalysisRequest {
  websiteContent: any
  analysisType:
    | 'business_model'
    | 'audience_insights'
    | 'value_propositions'
    | 'content_themes'
    | 'targeting_recommendations'
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
    "genders": ["all"],
    "locations": ["United States"],
    "job_titles": ["Marketing Manager", "Business Owner"],
    "income_level": "Middle to Upper income"
  },
  "psychographics": {
    "interests": ["Technology", "Business Growth"],
    "values": ["Innovation", "Efficiency"],
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

  static metaTargetingRecommendations(websiteContent: any, audienceInsights: AudienceInsights): string {
    return `You are an expert Meta Ads specialist. Generate HIGHLY SPECIFIC, ACCURATE targeting recommendations.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}

ACTUAL WEBSITE CONTENT:
Title: ${websiteContent.title}
Description: ${websiteContent.description}

Main Headings:
${websiteContent.headings?.slice(0, 15).join('\n') || 'N/A'}

Key Content:
${websiteContent.paragraphs?.slice(0, 10).join('\n\n') || 'N/A'}

Features/Benefits:
${websiteContent.listItems?.slice(0, 15).join('\n') || 'N/A'}

CTAs:
${websiteContent.ctas?.join(', ') || 'N/A'}

Target Audience:
Demographics: ${JSON.stringify(audienceInsights.demographics || {})}
Pain Points: ${JSON.stringify(audienceInsights.pain_points || [])}
Goals: ${JSON.stringify(audienceInsights.goals || [])}

CRITICAL: Use ONLY real Meta Ads categories. Be ULTRA-SPECIFIC. Provide evidence from website content.

Respond in JSON format:
{
  "demographics": {
    "age_ranges": ["25-34", "35-44"],
    "genders": ["all"],
    "locations": ["United States", "Canada"]
  },
  "interests": [
    {
      "category": "Business and industry",
      "specific_interests": ["Small business", "Entrepreneurship"],
      "reasoning": "Website explicitly targets small business owners",
      "confidence": 0.92,
      "evidence": "Direct mention in hero section"
    }
  ],
  "behaviors": [
    {
      "behavior": "Small business owners",
      "reasoning": "Content addresses business owners with growth pain points",
      "confidence": 0.88,
      "evidence": "Multiple references to business growth"
    }
  ],
  "custom_audiences": [
    {
      "type": "Website visitors (past 30 days)",
      "description": "Retarget warm leads who visited pricing pages",
      "reasoning": "High-intent visitors who showed interest",
      "implementation": "Install Meta Pixel, create custom audience from URL contains '/pricing'"
    }
  ],
  "lookalike_suggestions": [
    {
      "source": "Email list subscribers",
      "percentage": 1,
      "reasoning": "Find similar high-value prospects",
      "expected_reach": "500K-2M users"
    }
  ],
  "confidence_score": 0.85,
  "overall_reasoning": "Targeting based on clear business signals and website evidence"
}`
  }

  static googleTargetingRecommendations(websiteContent: any, audienceInsights: AudienceInsights): string {
    return `You are an expert Google Ads specialist. Generate HIGHLY ACCURATE, ACTIONABLE targeting recommendations.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}

Target Audience:
Pain Points: ${JSON.stringify(audienceInsights.pain_points || [])}
Goals: ${JSON.stringify(audienceInsights.goals || [])}

CRITICAL: Generate keywords people ACTUALLY search for. Use realistic search volumes. Organize by USER INTENT.

Respond in JSON format:
{
  "keyword_clusters": [
    {
      "intent": "Commercial Investigation: Users comparing solutions",
      "keywords": [
        {
          "keyword": "best project management software for small teams",
          "match_type": "phrase",
          "estimated_volume": "medium",
          "reasoning": "High-intent comparison search"
        }
      ],
      "reasoning": "Users actively evaluating solutions",
      "expected_cpc": "$3-8",
      "conversion_potential": "High"
    }
  ],
  "audiences": [
    {
      "type": "In-Market: Business Software",
      "description": "Users actively researching business software",
      "reasoning": "High intent with demonstrated purchase behavior",
      "estimated_reach": "500K-2M users",
      "recommended_bid_adjustment": "+20%"
    }
  ],
  "demographics": {
    "age_ranges": ["25-34", "35-44", "45-54"],
    "genders": ["all"],
    "household_income": ["top 30%", "top 40%"],
    "reasoning": "Business decision makers with purchasing power"
  },
  "placements": [
    {
      "type": "YouTube channels",
      "examples": ["Business education channels", "Productivity creators"],
      "reasoning": "Reach audience consuming relevant content",
      "recommended_strategy": "In-stream ads on business content"
    }
  ],
  "negative_keywords": ["free", "template", "tutorial"],
  "confidence_score": 0.88,
  "overall_reasoning": "Keyword strategy focuses on high-intent searches"
}`
  }

  static keywordFocusedMetaTargeting(websiteContent: any, audienceInsights: AudienceInsights, keywords: string[]): string {
    return `You are an expert Meta Ads specialist. Generate ULTRA-PRECISE, KEYWORD-FOCUSED targeting.

Website URL: ${websiteContent.url}
🎯 FOCUS KEYWORDS: ${keywords.join(', ')}

Website Content:
Title: ${websiteContent.title}
Headings: ${websiteContent.headings?.slice(0, 10).join('\n') || 'N/A'}

CRITICAL: Generate EXACTLY 10 audiences, 10 interests, 10 behaviors - all DIRECTLY related to: ${keywords.join(', ')}

Focus on HIGH-INTENT targeting showing PURCHASE INTENT for these keywords.

Respond in JSON format with 10 of each category, laser-focused on the keywords.`
  }

  static keywordFocusedGoogleTargeting(websiteContent: any, audienceInsights: AudienceInsights, keywords: string[]): string {
    return `You are an expert Google Ads specialist. Generate ULTRA-PRECISE, KEYWORD-FOCUSED targeting.

Website URL: ${websiteContent.url}
🎯 FOCUS KEYWORDS: ${keywords.join(', ')}

CRITICAL: Generate EXACTLY 10 audiences, 10 interests, 10 behaviors for: ${keywords.join(', ')}

Create keyword clusters with REAL search terms people actually type. Focus on HIGH-INTENT keywords.

Respond in JSON format with keyword clusters and targeting ALL focused on the provided keywords.`
  }
}

// ============================================================================
// AI ENGINE
// ============================================================================

export class AIReasoningEngine {
  private openaiClient: OpenAI | null = null
  private openrouterClient: OpenAI | null = null
  private currentModel = ''
  private readonly maxTokens = 4000
  private readonly temperature = 0.7

  // Available models by provider
  private readonly openaiModels = {
    analysis: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    creative: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
  }

  private readonly openrouterModels = {
    analysis: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3.1-70b-instruct:free',
      'meta-llama/llama-4-scout:free',
      'meta-llama/llama-4-maverick:free',
      'meta-llama/mistral-small-3.1-24b:free',
      'meta-llama/mistral-small-3.2-24b:free',
      'google/gemma-2-9b-it:free',
      'google/gemma-3-4b:free',
      'google/gemma-3-27b:free',
      'google/gemini-flash-1.5:free',
      'google/gemini-2.0-flash-exp:free',
      'mistralai/mistral-7b-instruct:free',
      'nousresearch/hermes-2-pro-llama-3-8b:free',
      'deepseek/deepseek-chat-v3-0324:free',
      'deepseek/deepseek-r1:free',
      'tng/deepseek-r1t-chimera:free',
      'tng/deepseek-r1t2-chimera:free',
      'z.ai/glm-4.5-air:free',
      'qwen/qwen2.5-vl-32b-instruct:free',
      'nvidia/nemotron-nano-12b-2-vl:free'
    ],
    creative: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3.1-70b-instruct:free',
      'meta-llama/llama-4-scout:free',
      'meta-llama/llama-4-maverick:free',
      'meta-llama/mistral-small-3.1-24b:free',
      'meta-llama/mistral-small-3.2-24b:free',
      'google/gemma-2-9b-it:free',
      'google/gemma-3-4b:free',
      'google/gemma-3-27b:free',
      'google/gemini-flash-1.5:free',
      'google/gemini-2.0-flash-exp:free',
      'mistralai/mistral-7b-instruct:free',
      'nousresearch/hermes-2-pro-llama-3-8b:free',
      'deepseek/deepseek-chat-v3-0324:free',
      'deepseek/deepseek-r1:free',
      'tng/deepseek-r1t-chimera:free',
      'tng/deepseek-r1t2-chimera:free',
      'z.ai/glm-4.5-air:free',
      'qwen/qwen2.5-vl-32b-instruct:free',
      'nvidia/nemotron-nano-12b-2-vl:free'
    ]
  }

  private readonly geminiModels = {
    analysis: ['gemini-2.5-flash', 'gemini-1.5-flash'],
    creative: ['gemini-2.5-flash', 'gemini-1.5-flash']
  }

  // ============================================================================
  // Client Initialization
  // ============================================================================

  private initializeOpenAI(): OpenAI {
    if (!this.openaiClient) {
      if (!config.ai.openaiKey) {
        throw new Error('OPENAI_API_KEY not set')
      }

      this.openaiClient = new OpenAI({
        apiKey: config.ai.openaiKey
      })

      logger.info('✅ OpenAI client initialized')
    }

    return this.openaiClient
  }

  private initializeOpenRouter(): OpenAI {
    if (!this.openrouterClient) {
      if (!config.ai.openrouterKey) {
        throw new Error('OPENROUTER_API_KEY not set')
      }

      this.openrouterClient = new OpenAI({
        apiKey: config.ai.openrouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://yourappdomain.com',
          'X-Title': 'AI Reasoning Engine'
        }
      })

      logger.info('✅ OpenRouter client initialized')
    }

    return this.openrouterClient
  }

  private async callGemini(prompt: string, systemMessage: string): Promise<any> {
    if (!config.ai.geminiKey) {
      throw new Error('GEMINI_API_KEY not set')
    }

    const models = this.geminiModels.creative
    let lastError: any = null

    for (const model of models) {
      try {
        this.currentModel = model
        logger.info(`🧠 Calling GEMINI → ${model}`)

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': config.ai.geminiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemMessage}\n\n${prompt}`
                }]
              }],
              generationConfig: {
                temperature: this.temperature,
                maxOutputTokens: this.maxTokens
              }
            })
          }
        )

        if (!response.ok) {
          const error = await response.json() as any
          throw new Error(error.error?.message || `HTTP ${response.status}`)
        }

        const data = await response.json()
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!content) throw new Error('Empty response from Gemini')

        logger.info(`✅ Success | Provider: gemini | Model: ${model}`)

        return {
          content,
          tokensUsed: (data as any).usageMetadata?.totalTokenCount || 0
        }
      } catch (err: any) {
        lastError = err
        logger.warn(`⚠️ Gemini model failed: ${model} → ${err.message}`)
      }
    }

    throw lastError || new Error('All Gemini models failed')
  }

  private getClient(provider: 'openai' | 'openrouter'): OpenAI {
    return provider === 'openai' ? this.initializeOpenAI() : this.initializeOpenRouter()
  }

  // ============================================================================
  // JSON Extraction (Bulletproof)
  // ============================================================================

  private extractJSON(text: string): any {
    // Try fenced code block first
    const fenced = text.match(/```json\s*([\s\S]*?)```/)
    if (fenced) return JSON.parse(fenced[1])

    // Try to find JSON object
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end + 1))
    }

    throw new Error('No valid JSON found in response')
  }

  // ============================================================================
  // Core AI Call (Multi-Provider Support with Fallback Chain)
  // ============================================================================

  private async callAI(
    prompt: string,
    systemMessage = 'You are an expert marketing analyst.',
    taskType: 'analysis' | 'creative' = 'creative',
    provider?: 'openai' | 'openrouter' | 'gemini',
    modelOverride?: string
  ): Promise<AIAnalysisResponse> {
    // Priority order: 1. Gemini, 2. OpenAI, 3. OpenRouter
    const providerOrder: Array<'gemini' | 'openai' | 'openrouter'> = ['gemini', 'openai', 'openrouter']
    
    let lastError: any = null

    for (const currentProvider of providerOrder) {
      // Skip if API key not configured
      if (currentProvider === 'gemini' && !config.ai.geminiKey) continue
      if (currentProvider === 'openai' && !config.ai.openaiKey) continue
      if (currentProvider === 'openrouter' && !config.ai.openrouterKey) continue

      try {
        logger.info(`🔄 Trying provider: ${currentProvider.toUpperCase()}`)

        // Handle Gemini separately (different API)
        if (currentProvider === 'gemini') {
          const result = await this.callGemini(prompt, systemMessage)
          const data = this.extractJSON(result.content)

          return {
            success: true,
            data,
            reasoning: data.reasoning || data.overall_reasoning,
            confidence: data.confidence || data.confidence_score || 0.8,
            tokensUsed: result.tokensUsed
          }
        }

        // Handle OpenAI and OpenRouter
        const client = this.getClient(currentProvider)
        const models = currentProvider === 'openai' ? this.openaiModels[taskType] : this.openrouterModels[taskType]
        const modelsToTry = modelOverride ? [modelOverride] : models

        for (const model of modelsToTry) {
          try {
            this.currentModel = model
            logger.info(`🧠 Calling ${currentProvider.toUpperCase()} (${taskType}) → ${model}`)

            const res = await client.chat.completions.create({
              model,
              temperature: this.temperature,
              max_tokens: this.maxTokens,
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
              ]
            })

            const content = res.choices[0]?.message?.content
            if (!content) throw new Error('Empty response')

            const data = this.extractJSON(content)

            logger.info(`✅ Success | Provider: ${currentProvider} | Model: ${model} | Tokens: ${res.usage?.total_tokens ?? 0}`)

            return {
              success: true,
              data,
              reasoning: data.reasoning || data.overall_reasoning,
              confidence: data.confidence || data.confidence_score || 0.8,
              tokensUsed: res.usage?.total_tokens
            }
          } catch (err: any) {
            lastError = err
            logger.warn(`⚠️ Model failed: ${model} → ${err.message}`)
          }
        }

        logger.warn(`❌ All models failed for ${currentProvider}`)
      } catch (err: any) {
        lastError = err
        logger.warn(`⚠️ Provider failed: ${currentProvider} → ${err.message}`)
      }
    }

    logger.error(`❌ All providers failed (Gemini → OpenAI → OpenRouter)`)
    return {
      success: false,
      data: null,
      confidence: 0,
      error: lastError?.message || 'All AI providers failed'
    }
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  async analyzeBusinessModel(websiteContent: any, provider?: 'openai' | 'openrouter' | 'gemini', model?: string): Promise<AIAnalysisResponse> {
    const prompt = `Analyze this website's business model and respond in JSON format with: type, description, confidence, reasoning.

Website: ${websiteContent.url}
Title: ${websiteContent.title}
Content: ${websiteContent.text.substring(0, 1000)}`

    return this.callAI(prompt, undefined, 'analysis', provider, model)
  }

  async analyzeAudienceInsights(websiteContent: any, provider?: 'openai' | 'openrouter' | 'gemini', model?: string): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.audienceInsightsAnalysis(websiteContent)
    return this.callAI(prompt, undefined, 'analysis', provider, model)
  }

  async extractValuePropositions(websiteContent: any, provider?: 'openai' | 'openrouter' | 'gemini', model?: string): Promise<AIAnalysisResponse> {
    const prompt = `Extract value propositions from this website and respond in JSON.

Website: ${websiteContent.url}
Headings: ${websiteContent.headings?.slice(0, 10).join(', ')}

Respond with: { "value_propositions": [{ "proposition": "text", "category": "type", "strength": 0.8 }] }`

    return this.callAI(prompt, undefined, 'creative', provider, model)
  }

  async analyzeContentThemes(websiteContent: any, provider?: 'openai' | 'openrouter' | 'gemini', model?: string): Promise<AIAnalysisResponse> {
    const prompt = `Analyze content themes and respond in JSON.

Content: ${websiteContent.text.substring(0, 1000)}

Respond with: { "themes": [{ "theme": "name", "keywords": [], "frequency": 5, "relevance_score": 0.8 }] }`

    return this.callAI(prompt, undefined, 'creative', provider, model)
  }

  async generateMetaTargeting(websiteContent: any, audience: AudienceInsights, provider?: 'openai' | 'openrouter' | 'gemini', model?: string): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.metaTargetingRecommendations(websiteContent, audience)
    return this.callAI(
      prompt,
      'You are an expert Meta Ads specialist. Generate specific, actionable targeting recommendations.',
      'creative',
      provider,
      model
    )
  }

  async generateGoogleTargeting(websiteContent: any, audience: AudienceInsights, provider?: 'openai' | 'openrouter' | 'gemini', model?: string): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.googleTargetingRecommendations(websiteContent, audience)
    return this.callAI(
      prompt,
      'You are an expert Google Ads specialist. Generate actionable targeting recommendations.',
      'creative',
      provider,
      model
    )
  }

  async generateKeywordFocusedMetaTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights,
    keywords: string[],
    provider?: 'openai' | 'openrouter' | 'gemini',
    model?: string
  ): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.keywordFocusedMetaTargeting(websiteContent, audienceInsights, keywords)
    return this.callAI(
      prompt,
      'You are an expert Meta Ads specialist. Generate EXACTLY 10 audiences, interests, and behaviors for the keywords.',
      'creative',
      provider,
      model
    )
  }

  async generateKeywordFocusedGoogleTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights,
    keywords: string[],
    provider?: 'openai' | 'openrouter' | 'gemini',
    model?: string
  ): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.keywordFocusedGoogleTargeting(websiteContent, audienceInsights, keywords)
    return this.callAI(
      prompt,
      'You are an expert Google Ads specialist. Generate keyword-focused targeting for the provided keywords.',
      'creative',
      provider,
      model
    )
  }

  // ============================================================================
  // Status & Configuration
  // ============================================================================

  isConfigured(): boolean {
    return !!(config.ai.geminiKey || config.ai.openaiKey || config.ai.openrouterKey)
  }

  getAvailableModels() {
    return {
      gemini: {
        available: !!config.ai.geminiKey,
        models: this.geminiModels.creative
      },
      openai: {
        available: !!config.ai.openaiKey,
        models: this.openaiModels.creative
      },
      openrouter: {
        available: !!config.ai.openrouterKey,
        models: this.openrouterModels.creative
      }
    }
  }

  getModelInfo() {
    return {
      provider: config.ai.provider,
      gemini: this.geminiModels.creative[0],
      openai: this.openaiModels.creative[0],
      openrouter: this.openrouterModels.creative[0],
      temperature: this.temperature,
      maxTokens: this.maxTokens
    }
  }
}

// Singleton
export const aiReasoningEngine = new AIReasoningEngine()
