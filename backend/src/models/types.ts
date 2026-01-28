/**
 * TypeScript type definitions for RiseRoutes AI Ads Intelligence Platform
 * These types correspond to the database schema and domain models
 */

// ============================================================================
// User and Authentication Types
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  company: string | null
  subscription_tier: SubscriptionTier
  created_at: Date
  last_login: Date | null
}

export interface CreateUserInput {
  email: string
  password: string
  first_name?: string
  last_name?: string
  company?: string
  subscription_tier?: SubscriptionTier
}

export interface UpdateUserInput {
  first_name?: string
  last_name?: string
  company?: string
  subscription_tier?: SubscriptionTier
  last_login?: Date
}

// ============================================================================
// Analysis Session Types
// ============================================================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AnalysisSession {
  id: string
  user_id: string
  website_url: string
  target_location: string | null
  competitor_urls: string[] | null
  status: AnalysisStatus
  created_at: Date
  completed_at: Date | null
  analysis_data: AnalysisData | null
}

export interface CreateAnalysisSessionInput {
  user_id: string
  website_url: string
  target_location?: string
  competitor_urls?: string[]
}

export interface UpdateAnalysisSessionInput {
  status?: AnalysisStatus
  completed_at?: Date
  analysis_data?: AnalysisData
}

export interface AnalysisData {
  executive_summary?: string
  key_findings?: string[]
  processing_time_ms?: number
  error_message?: string
}

// ============================================================================
// Website Analysis Types
// ============================================================================

export interface WebsiteAnalysis {
  id: string
  session_id: string
  url: string
  business_model: string | null
  value_propositions: ValueProposition[] | null
  target_audience: AudienceInsights | null
  content_themes: ContentTheme[] | null
  technical_metadata: TechnicalMetadata | null
  analysis_timestamp: Date
}

export interface CreateWebsiteAnalysisInput {
  session_id: string
  url: string
  business_model?: string
  value_propositions?: ValueProposition[]
  target_audience?: AudienceInsights
  content_themes?: ContentTheme[]
  technical_metadata?: TechnicalMetadata
}

export interface BusinessModel {
  type: string
  description: string
  confidence: number
}

export interface ValueProposition {
  proposition: string
  category: string
  strength: number
}

export interface AudienceInsights {
  demographics?: DemographicData
  psychographics?: PsychographicData
  pain_points?: string[]
  goals?: string[]
  behaviors?: string[]
}

export interface DemographicData {
  age_ranges?: string[]
  genders?: string[]
  locations?: string[]
  income_levels?: string[]
  education_levels?: string[]
  job_titles?: string[]
}

export interface PsychographicData {
  interests?: string[]
  values?: string[]
  lifestyle?: string[]
  personality_traits?: string[]
}

export interface ContentTheme {
  theme: string
  keywords: string[]
  frequency: number
  relevance_score: number
}

export interface TechnicalMetadata {
  title?: string
  description?: string
  keywords?: string[]
  og_tags?: Record<string, string>
  structured_data?: any
  page_load_time_ms?: number
  mobile_friendly?: boolean
}

// ============================================================================
// Competitor Analysis Types
// ============================================================================

export interface CompetitorAnalysis {
  id: string
  session_id: string
  competitor_url: string
  positioning: Positioning | null
  audience_insights: AudienceInsights | null
  content_strategy: ContentStrategy | null
  market_share_data: MarketShareData | null
  analysis_timestamp: Date
}

export interface CreateCompetitorAnalysisInput {
  session_id: string
  competitor_url: string
  positioning?: Positioning
  audience_insights?: AudienceInsights
  content_strategy?: ContentStrategy
  market_share_data?: MarketShareData
}

export interface Positioning {
  unique_value_proposition?: string
  target_market?: string
  competitive_advantages?: string[]
  messaging_themes?: string[]
  brand_personality?: string[]
}

export interface ContentStrategy {
  content_types?: string[]
  publishing_frequency?: string
  tone_of_voice?: string
  key_topics?: string[]
  engagement_tactics?: string[]
}

export interface MarketShareData {
  estimated_traffic?: number
  domain_authority?: number
  backlink_count?: number
  social_presence?: Record<string, number>
  estimated_ad_spend?: number
}

// ============================================================================
// Targeting Recommendations Types
// ============================================================================

export type AdPlatform = 'meta' | 'google'

export interface TargetingRecommendation {
  id: string
  session_id: string
  platform: AdPlatform
  targeting_data: MetaTargeting | GoogleTargeting
  confidence_scores: ConfidenceScore[] | null
  explanations: RecommendationExplanation[] | null
  created_at: Date
}

export interface CreateTargetingRecommendationInput {
  session_id: string
  platform: AdPlatform
  targeting_data: MetaTargeting | GoogleTargeting
  confidence_scores?: ConfidenceScore[]
  explanations?: RecommendationExplanation[]
}

export interface MetaTargeting {
  demographics: DemographicTargeting
  interests: InterestTargeting[]
  behaviors: BehaviorTargeting[]
  custom_audiences?: CustomAudienceRecommendation[]
  lookalike_suggestions?: LookalikeAudience[]
}

export interface DemographicTargeting {
  age_min?: number
  age_max?: number
  genders?: string[]
  locations?: LocationTargeting[]
  languages?: string[]
  education_levels?: string[]
  job_titles?: string[]
  relationship_statuses?: string[]
}

export interface LocationTargeting {
  type: 'country' | 'region' | 'city' | 'zip'
  name: string
  radius?: number
  radius_unit?: 'mile' | 'kilometer'
}

export interface InterestTargeting {
  category: string
  interests: string[]
  confidence: number
  reasoning: string
}

export interface BehaviorTargeting {
  category: string
  behaviors: string[]
  confidence: number
  reasoning: string
}

export interface CustomAudienceRecommendation {
  type: 'website_visitors' | 'customer_list' | 'engagement'
  description: string
  estimated_size?: number
}

export interface LookalikeAudience {
  source: string
  percentage: number
  description: string
}

export interface GoogleTargeting {
  keywords: KeywordCluster[]
  audiences: GoogleAudience[]
  demographics: DemographicTargeting
  placements?: PlacementRecommendation[]
}

export interface KeywordCluster {
  intent: string
  keywords: Keyword[]
  search_volume: number
  competition_level: 'low' | 'medium' | 'high'
  opportunities: string[]
}

export interface Keyword {
  keyword: string
  match_type: 'broad' | 'phrase' | 'exact'
  search_volume: number
  competition: number
  suggested_bid?: number
}

export interface GoogleAudience {
  type: 'affinity' | 'in_market' | 'custom_intent' | 'remarketing'
  name: string
  description: string
  estimated_reach?: number
}

export interface PlacementRecommendation {
  type: 'website' | 'app' | 'video' | 'channel'
  name: string
  url?: string
  reasoning: string
}

export interface ConfidenceScore {
  category: string
  score: number
  factors: string[]
}

export interface RecommendationExplanation {
  recommendation_id: string
  recommendation_type: string
  reasoning: string
  supporting_data: string[]
  why_it_matters: string
}

// ============================================================================
// Export History Types
// ============================================================================

export type ExportType = 'meta_csv' | 'google_csv' | 'client_report' | 'clipboard'

export interface ExportHistory {
  id: string
  session_id: string
  export_type: ExportType
  filename: string | null
  export_data: ExportData | null
  created_at: Date
}

export interface CreateExportHistoryInput {
  session_id: string
  export_type: ExportType
  filename?: string
  export_data?: ExportData
}

export interface ExportData {
  format: string
  row_count?: number
  file_size_bytes?: number
  metadata?: Record<string, any>
}

// ============================================================================
// Analysis Cache Types
// ============================================================================

export interface AnalysisCache {
  id: string
  cache_key: string
  cache_data: any
  expires_at: Date
  created_at: Date
}

export interface CreateAnalysisCacheInput {
  cache_key: string
  cache_data: any
  expires_at: Date
}

// ============================================================================
// Query Result Types
// ============================================================================

export interface PaginationParams {
  limit: number
  offset: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

// ============================================================================
// Error Types
// ============================================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
