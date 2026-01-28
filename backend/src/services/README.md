# Services

This directory contains business logic services for the RiseRoutes AI Ads Intelligence Platform.

## AI Reasoning Engine

The `aiReasoningEngine.ts` service provides OpenAI GPT-4 integration for intelligent analysis and reasoning tasks. This is the core AI service that powers advanced analysis capabilities across the platform.

### Features

- **OpenAI GPT-4 Integration**: Direct integration with OpenAI's most advanced language model
- **Specialized Prompt Templates**: Pre-built prompts for business model analysis, audience insights, and targeting recommendations
- **Response Parsing & Validation**: Automatic validation and sanitization of AI responses
- **Retry Logic**: Automatic retry with exponential backoff for failed API calls
- **Token Usage Tracking**: Monitor API usage and costs
- **Confidence Scoring**: AI-generated confidence scores for all recommendations

### Usage

```typescript
import { aiReasoningEngine } from './services/aiReasoningEngine.js'

// Check if OpenAI is configured
if (!aiReasoningEngine.isConfigured()) {
  throw new Error('OpenAI API key not configured')
}

// Analyze business model
const websiteContent = {
  url: 'https://example.com',
  title: 'Example Business',
  description: 'We help businesses grow',
  text: 'Full website text content...',
  headings: ['Main Heading', 'Secondary Heading']
}

const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)

if (result.success) {
  console.log('Business Model:', result.data.type)
  console.log('Confidence:', result.confidence)
  console.log('Reasoning:', result.reasoning)
  console.log('Tokens Used:', result.tokensUsed)
}

// Generate Meta Ads targeting
const audienceInsights = {
  demographics: { age_ranges: ['25-34'], job_titles: ['Manager'] },
  pain_points: ['Wasting time on manual tasks'],
  goals: ['Increase productivity']
}

const metaTargeting = await aiReasoningEngine.generateMetaTargeting(
  websiteContent,
  audienceInsights
)

// Generate Google Ads targeting
const googleTargeting = await aiReasoningEngine.generateGoogleTargeting(
  websiteContent,
  audienceInsights
)
```

### Available Analysis Methods

1. **analyzeBusinessModel()**: Identifies business model type and characteristics
2. **analyzeAudienceInsights()**: Extracts comprehensive audience insights (demographics, psychographics, pain points, goals, behaviors)
3. **generateMetaTargeting()**: Creates Meta Ads targeting recommendations with interests, behaviors, and custom audiences
4. **generateGoogleTargeting()**: Creates Google Ads targeting with intent-based keyword clusters
5. **extractValuePropositions()**: Extracts and categorizes value propositions
6. **analyzeContentThemes()**: Identifies content themes and messaging patterns

### Prompt Templates

The service includes specialized prompt templates optimized for each analysis type:

- `businessModelAnalysis`: Business model classification
- `audienceInsightsAnalysis`: Audience insights extraction
- `metaTargetingRecommendations`: Meta Ads targeting generation
- `googleTargetingRecommendations`: Google Ads targeting with intent clustering
- `valuePropositionExtraction`: Value proposition analysis
- `contentThemeAnalysis`: Content theme identification

### Response Validation

All AI responses are automatically validated to ensure data integrity:

- **Type Safety**: Responses conform to TypeScript interfaces
- **Default Values**: Sensible defaults for missing fields
- **Error Prevention**: Catches malformed responses
- **Data Consistency**: Guarantees consistent structures

### Error Handling

- **Automatic Retries**: Failed API calls retry up to 3 times with exponential backoff
- **Graceful Degradation**: Returns error details when analysis fails
- **Comprehensive Logging**: All errors logged for debugging

### Configuration

Set the OpenAI API key in your `.env` file:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

Model configuration (in `aiReasoningEngine.ts`):
```typescript
model: 'gpt-4-turbo-preview'
maxTokens: 2000
temperature: 0.7
```

### Testing

```bash
npm test -- aiReasoningEngine.test.ts
```

### Requirements

Implements:
- **Requirement 2.1**: AI-powered Meta Ads targeting recommendations
- **Requirement 2.2**: AI-powered Google Ads targeting recommendations
- **Requirement 2.4**: Reasoning explanations for all recommendations

### Documentation

See [AI_REASONING_ENGINE.md](./AI_REASONING_ENGINE.md) for comprehensive documentation including:
- Detailed usage examples
- Response structures
- Best practices
- Troubleshooting guide
- Performance considerations

---

## Business Model Classifier

The `businessModelClassifier.ts` service provides AI-powered business model detection, value proposition extraction, and audience signal identification.

### Features

- **Business Model Detection**: Automatically classifies websites into 20+ business model types including B2B SaaS, E-commerce, Agency, Consulting, etc.
- **Value Proposition Extraction**: Identifies and categorizes key value propositions from website content
- **Audience Signal Identification**: Extracts demographic data, pain points, goals, and behavioral signals
- **Content Theme Analysis**: Identifies dominant themes like Innovation, Trust & Security, Performance, etc.

### Usage

```typescript
import { businessModelClassifier, WebsiteContent } from './services/businessModelClassifier.js'

// Prepare website content
const content: WebsiteContent = {
  url: 'https://example.com',
  title: 'Enterprise Workflow Automation',
  description: 'Automate your team workflows',
  headings: ['Enterprise Platform', 'API Integration'],
  paragraphs: ['Our platform helps teams...'],
  ctaButtons: ['Start Free Trial'],
  navigationLinks: ['Features', 'Pricing']
}

// Classify business model
const result = await businessModelClassifier.classifyBusinessModel(content)

console.log(result.businessModel.type) // 'B2B SaaS'
console.log(result.valuePropositions) // Array of value propositions
console.log(result.audienceSignals) // Audience insights
console.log(result.contentThemes) // Content themes
console.log(result.confidence) // Overall confidence score
```

### Business Model Types

The classifier supports 20 business model types:

- B2B SaaS
- B2C SaaS
- E-commerce
- Marketplace
- Service Business
- Agency
- Consulting
- Education/Training
- Content/Media
- Non-profit
- Healthcare
- Real Estate
- Financial Services
- Manufacturing
- Retail
- Hospitality
- Professional Services
- Technology Product
- Subscription Service
- Freemium Model

### Value Proposition Categories

Value propositions are automatically categorized into:

- `cost_savings`: Save, reduce, cut costs
- `speed`: Fast, quick, instant
- `ease_of_use`: Easy, simple, intuitive
- `quality`: Best, top, premium
- `growth`: Grow, increase, boost
- `security`: Secure, safe, protected
- `general`: Other value propositions

### Confidence Scoring

The classifier provides confidence scores at multiple levels:

- **Business Model Confidence**: How confident the classifier is about the detected business model (0-1)
- **Value Proposition Strength**: Individual strength scores for each value proposition (0-1)
- **Overall Confidence**: Combined confidence considering all factors (0-1)

### Testing

The service includes comprehensive unit tests covering:

- Business model detection for various types
- Value proposition extraction and categorization
- Audience signal identification
- Content theme analysis
- Edge cases (empty content, special characters, long content)

Run tests with:

```bash
npm test -- businessModelClassifier.test.ts
```

### Requirements

Implements **Requirement 1.2**: Website content analysis and business model classification

### Integration

This service is designed to be used by the Website Analyzer service (Task 4.1) to provide business model insights as part of the complete website analysis workflow.

---

## Meta Targeting Generator

The `metaTargetingGenerator.ts` service generates Meta (Facebook/Instagram) Ads targeting recommendations based on website analysis and competitor intelligence.

### Features

- **Demographics Targeting**: Age, gender, location, education, and job title targeting
- **Interest Targeting**: Maps business models to Meta's interest categories with confidence scores
- **Behavior Targeting**: Identifies relevant user behaviors (purchase, digital, business, etc.)
- **Custom Audience Recommendations**: Suggests website visitors, engagement, and customer list audiences
- **Lookalike Audience Suggestions**: Recommends 1%, 3%, and 5% lookalike audiences
- **Confidence Scoring**: Provides detailed confidence scores for all targeting recommendations

### Usage

```typescript
import { metaTargetingGenerator, MetaTargetingInput } from './services/metaTargetingGenerator.js'

// Prepare input data
const input: MetaTargetingInput = {
  websiteAnalysis: {
    // WebsiteAnalysis object from database
    business_model: 'B2B SaaS',
    target_audience: { /* audience insights */ },
    content_themes: [ /* themes */ ]
  },
  targetLocation: 'United States',
  businessClassification: { /* optional */ },
  competitorAnalyses: [ /* optional */ ]
}

// Generate Meta targeting recommendations
const targeting = await metaTargetingGenerator.generateTargeting(input)

console.log(targeting.demographics) // Age, gender, location, education
console.log(targeting.interests) // Interest categories with confidence
console.log(targeting.behaviors) // Behavior categories with confidence
console.log(targeting.custom_audiences) // Custom audience recommendations
console.log(targeting.lookalike_suggestions) // Lookalike audience suggestions

// Calculate confidence scores
const confidenceScores = metaTargetingGenerator.calculateConfidenceScores(
  targeting,
  input.websiteAnalysis
)

console.log(confidenceScores) // Detailed confidence breakdown
```

### Meta Interest Categories

The service maps business models to Meta's actual interest categories:

- **BUSINESS**: Business and industry, Small business, Entrepreneurship, Marketing, Sales
- **TECHNOLOGY**: Technology, Software, Cloud computing, AI, Web development, SaaS
- **SHOPPING**: Online shopping, Shopping and fashion, Retail, E-commerce
- **HEALTH**: Health and wellness, Fitness, Nutrition, Mental health
- **FINANCE**: Personal finance, Investing, Banking, Financial planning, Real estate
- **EDUCATION**: Education, Online learning, Professional development, Career development
- **ENTERTAINMENT**: Entertainment, Movies, Music, Gaming, Streaming services
- **LIFESTYLE**: Lifestyle, Travel, Food and dining, Home and garden, Parenting

### Meta Behavior Categories

The service targets relevant user behaviors:

- **PURCHASE**: Engaged shoppers, Online shoppers, Frequent purchasers, Premium purchasers
- **DEVICE**: Mobile device users, Desktop users, iOS users, Android users
- **TRAVEL**: Frequent travelers, Business travelers, Commuters
- **DIGITAL**: Technology early adopters, Small business owners, IT decision makers
- **BUSINESS**: Business decision makers, Small business owners, IT professionals

### Confidence Scoring Algorithm

The service implements a sophisticated confidence scoring algorithm (Requirement 2.3):

1. **Demographics Confidence** (30% weight):
   - Age range inference: +0.15
   - Location targeting: +0.15
   - Education levels: +0.10
   - Job titles: +0.10

2. **Interests Confidence** (40% weight):
   - Number of interests: +0.1 to +0.2
   - Business model alignment: +0.2
   - Content theme alignment: +0.1

3. **Behaviors Confidence** (30% weight):
   - Business model alignment: +0.2
   - Number of behaviors: +0.1

4. **Overall Confidence**: Weighted average of all components

### Custom Audience Recommendations

The service recommends three types of custom audiences:

1. **Website Visitors**: People who visited your website in the last 30 days
2. **Engagement**: People who engaged with your Facebook Page or Instagram profile
3. **Customer List**: Upload customer email list (for applicable business models)

### Lookalike Audience Strategy

The service recommends a tiered lookalike audience approach:

- **1% Lookalike**: Most similar, highest quality, smallest reach
- **3% Lookalike**: Balanced similarity and reach (recommended starting point)
- **5% Lookalike**: Broader reach with good similarity (for scaling)

### Testing

Run tests with:

```bash
npm test -- metaTargetingGenerator.test.ts
```

### Requirements

Implements:
- **Requirement 2.1**: Generate Meta Ads audience recommendations with interests, behaviors, and demographics
- **Requirement 2.3**: Provide confidence scores for each suggestion

### Integration

This service integrates with:
- **Website Analyzer**: Uses website analysis data as input
- **Business Model Classifier**: Leverages business model classification for targeting
- **Competitor Intelligence**: Incorporates competitor analysis for refined targeting
- **Targeting Recommendations Repository**: Stores generated targeting data
