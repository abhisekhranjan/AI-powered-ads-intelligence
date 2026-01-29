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
// Prompt Templates (Essential for Accuracy)
// ============================================================================

class PromptTemplates {
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

Call-to-Actions:
${websiteContent.ctas?.join(', ') || 'N/A'}

Target Audience:
Demographics: ${JSON.stringify(audienceInsights.demographics || {})}
Pain Points: ${JSON.stringify(audienceInsights.pain_points || [])}
Goals: ${JSON.stringify(audienceInsights.goals || [])}

CRITICAL INSTRUCTIONS:
1. Use ONLY real Meta Ads interest categories that exist in Meta Business Manager
2. Be ULTRA-SPECIFIC - Instead of "Business", use "Small business owners"
3. Match interests to the EXACT service/product mentioned in the content
4. For behaviors, use actual Meta behavior categories
5. Every recommendation must have clear evidence from the website content

Generate Meta Ads targeting with:
- Demographics (age, gender, locations)
- Detailed interests (REAL Meta categories)
- Behaviors (actual Meta behavior categories)
- Custom audience suggestions
- Lookalike audience recommendations

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
      "reasoning": "Content specifically addresses business owners",
      "confidence": 0.88,
      "evidence": "Multiple references to 'your business'"
    }
  ],
  "custom_audiences": [
    {
      "type": "Website visitors (past 30 days)",
      "description": "Retarget warm leads who visited pricing pages",
      "reasoning": "High-intent visitors who showed interest",
      "implementation": "Install Meta Pixel and create custom audience"
    }
  ],
  "lookalike_suggestions": [
    {
      "source": "Email list subscribers",
      "percentage": 1,
      "reasoning": "Find similar high-value prospects",
      "expected_reach": "Estimated 500K-2M users"
    }
  ],
  "confidence_score": 0.85,
  "overall_reasoning": "Targeting strategy based on clear business model signals and explicit audience mentions."
}`
  }

  static googleTargetingRecommendations(websiteContent: any, audienceInsights: AudienceInsights): string {
    return `You are an expert Google Ads specialist. Generate HIGHLY ACCURATE, ACTIONABLE targeting recommendations.

Website URL: ${websiteContent.url}
Business Model: ${websiteContent.businessModel?.type || 'Unknown'}

Target Audience Insights:
Pain Points: ${JSON.stringify(audienceInsights.pain_points || [])}
Goals: ${JSON.stringify(audienceInsights.goals || [])}
Behaviors: ${JSON.stringify(audienceInsights.behaviors || [])}

CRITICAL INSTRUCTIONS:
1. Generate keywords that people ACTUALLY search for
2. Organize by USER INTENT:
   - Informational: "how to", "what is", "guide to"
   - Commercial: "best", "top", "review", "vs"
   - Transactional: "buy", "price", "cost", "hire"
3. Use realistic search volumes (high = 10K+, medium = 1K-10K, low = <1K monthly)
4. Audiences must be REAL Google Ads audience categories
5. Every keyword should be something a real person would type into Google

Generate specific Google Ads targeting recommendations including:
1. Keyword clusters organized by USER INTENT
2. Strategic match types for each keyword
3. Realistic estimated search volume categories
4. Real Google Ads audience targeting options
5. Demographic targeting based on actual signals

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
      "reasoning": "High intent audience with purchase behavior",
      "estimated_reach": "500K-2M users",
      "recommended_bid_adjustment": "+20%"
    }
  ],
  "demographics": {
    "age_ranges": ["25-34", "35-44", "45-54"],
    "genders": ["all"],
    "household_income": ["top 30%", "top 40%"],
    "reasoning": "Business decision makers in these demographics"
  },
  "placements": [
    {
      "type": "YouTube channels",
      "examples": ["Business education channels", "Productivity creators"],
      "reasoning": "Reach audience consuming relevant content",
      "recommended_strategy": "In-stream ads on business content"
    }
  ],
  "negative_keywords": ["free", "template", "tutorial", "diy"],
  "campaign_structure_recommendation": "Separate campaigns by intent level",
  "confidence_score": 0.88,
  "overall_reasoning": "Keyword strategy focuses on high-intent commercial searches."
}`
  }

  static keywordFocusedMetaTargeting(websiteContent: any, audienceInsights: AudienceInsights, keywords: string[]): string {
    return `You are an expert Meta Ads specialist. Generate ULTRA-PRECISE, KEYWORD-FOCUSED targeting.

Website URL: ${websiteContent.url}
🎯 FOCUS KEYWORDS: ${keywords.join(', ')}

Website Content:
Title: ${websiteContent.title}
Main Headings: ${websiteContent.headings?.slice(0, 10).join(', ') || 'N/A'}

🎯 CRITICAL REQUIREMENTS:
1. Generate EXACTLY 10 target audiences - DIRECTLY related to: ${keywords.join(', ')}
2. Generate EXACTLY 10 interests - active interest in: ${keywords.join(', ')}
3. Generate EXACTLY 10 behaviors - PURCHASE INTENT for: ${keywords.join(', ')}
4. Use ONLY real Meta Ads categories
5. Focus on HIGH-INTENT targeting

Generate EXACTLY 10 of each category, all laser-focused on: ${keywords.join(', ')}

Respond in JSON format with demographics, interests (10), behaviors (10), custom_audiences, lookalike_suggestions.`
  }

  static keywordFocusedGoogleTargeting(websiteContent: any, audienceInsights: AudienceInsights, keywords: string[]): string {
    return `You are an expert Google Ads specialist. Generate ULTRA-PRECISE, KEYWORD-FOCUSED targeting.

Website URL: ${websiteContent.url}
🎯 FOCUS KEYWORDS: ${keywords.join(', ')}

🎯 CRITICAL REQUIREMENTS:
1. Generate EXACTLY 10 target audiences for: ${keywords.join(', ')}
2. Generate EXACTLY 10 interests related to: ${keywords.join(', ')}
3. Generate EXACTLY 10 behaviors showing purchase intent
4. Create keyword clusters with REAL search terms
5. Focus on HIGH-INTENT keywords

Generate keyword clusters, audiences, and targeting ALL focused on: ${keywords.join(', ')}

Respond in JSON format with keyword_clusters, audiences, demographics, placements.`
  }
}

// ============================================================================
// AI ENGINE
// ============================================================================

export class AIReasoningEngine {
  private openai: OpenAI | null = null
  private currentModel = ''
  private readonly maxTokens = 4000
  private readonly temperature = 0.7

  // ✅ VERIFIED FREE OPENROUTER MODELS (2026 SAFE)
  private readonly models = {
    analysis: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'google/gemma-2-9b-it:free',
      'nousresearch/hermes-2-pro-llama-3-8b:free',
      'mistralai/mistral-7b-instruct:free'
    ],
    creative: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'google/gemma-2-9b-it:free',
      'nousresearch/hermes-2-pro-llama-3-8b:free',
      'mistralai/mistral-7b-instruct:free'
    ]
  }

  // ============================================================================
  // OpenRouter Client
  // ============================================================================

  private initializeClient(): OpenAI {
    if (!this.openai) {
      if (!config.openai.apiKey) {
        throw new Error('OPENAI_API_KEY not set')
      }

      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://yourappdomain.com',
          'X-Title': 'AI Reasoning Engine'
        }
      })

      logger.info('✅ OpenRouter client initialized')
    }

    return this.openai
  }

  // ============================================================================
  // JSON Extraction (Bulletproof)
  // ============================================================================

  private extractJSON(text: string): any {
    // Try fenced code block first
    const fenced = text.match(/```json\s*([\s\S]*?)```/)
    if (fenced) return JSON.parse(fenced[1])

    // Try finding JSON object
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end + 1))
    }

    throw new Error('No valid JSON found in response')
  }

  // ============================================================================
  // Core OpenRouter Call (REAL Model Rotation)
  // ============================================================================

  private async callOpenAI(
    prompt: string,
    systemMessage = 'You are an expert marketing analyst specializing in digital advertising.',
    taskType: 'analysis' | 'creative' = 'creative'
  ): Promise<AIAnalysisResponse> {
    const client = this.initializeClient()
    const models = this.models[taskType]
    let lastError: any = null

    for (const model of models) {
      try {
        this.currentModel = model
        logger.info(`🧠 Calling OpenRouter (${taskType}) → ${model}`)

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

        logger.info(`✅ Success | Model: ${model} | Tokens: ${res.usage?.total_tokens ?? 0}`)

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

    logger.error('❌ All models failed')
    return {
      success: false,
      data: null,
      confidence: 0,
      error: lastError?.message || 'All AI models failed'
    }
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  async analyzeBusinessModel(websiteContent: any): Promise<AIAnalysisResponse> {
    const prompt = `Analyze the business model for ${websiteContent.url} and respond in JSON format with: type, description, confidence, reasoning.`
    return this.callOpenAI(prompt, undefined, 'analysis')
  }

  async analyzeAudienceInsights(websiteContent: any): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.audienceInsightsAnalysis(websiteContent)
    return this.callOpenAI(prompt, undefined, 'analysis')
  }

  async extractValuePropositions(websiteContent: any): Promise<AIAnalysisResponse> {
    const prompt = `Extract value propositions from ${websiteContent.url} and respond in JSON format.`
    return this.callOpenAI(prompt)
  }

  async analyzeContentThemes(websiteContent: any): Promise<AIAnalysisResponse> {
    const prompt = `Analyze content themes for ${websiteContent.url} and respond in JSON format.`
    return this.callOpenAI(prompt)
  }

  async generateMetaTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights
  ): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.metaTargetingRecommendations(websiteContent, audienceInsights)
    return this.callOpenAI(
      prompt,
      'You are an expert Meta Ads specialist. Generate specific, actionable targeting recommendations.'
    )
  }

  async generateGoogleTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights
  ): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.googleTargetingRecommendations(websiteContent, audienceInsights)
    return this.callOpenAI(
      prompt,
      'You are an expert Google Ads specialist. Generate specific keyword clusters and targeting recommendations.'
    )
  }

  async generateKeywordFocusedMetaTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights,
    keywords: string[]
  ): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.keywordFocusedMetaTargeting(websiteContent, audienceInsights, keywords)
    return this.callOpenAI(
      prompt,
      'You are an expert Meta Ads specialist. Generate EXACTLY 10 audiences, 10 interests, and 10 behaviors.'
    )
  }

  async generateKeywordFocusedGoogleTargeting(
    websiteContent: any,
    audienceInsights: AudienceInsights,
    keywords: string[]
  ): Promise<AIAnalysisResponse> {
    const prompt = PromptTemplates.keywordFocusedGoogleTargeting(websiteContent, audienceInsights, keywords)
    return this.callOpenAI(
      prompt,
      'You are an expert Google Ads specialist. Generate keyword-focused targeting with EXACTLY 10 audiences.'
    )
  }

  // ============================================================================
  // Status
  // ============================================================================

  isConfigured(): boolean {
    return !!config.openai.apiKey
  }

  getModelInfo() {
    return {
      analysis: this.models.analysis[0],
      creative: this.models.creative[0],
      temperature: this.temperature,
      maxTokens: this.maxTokens
    }
  }
}

// Singleton
export const aiReasoningEngine = new AIReasoningEngine()
