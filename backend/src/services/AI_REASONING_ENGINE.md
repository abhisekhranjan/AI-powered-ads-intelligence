# AI Reasoning Engine Documentation

## Overview

The AI Reasoning Engine is a core service that integrates OpenAI GPT-4 to provide intelligent analysis and reasoning capabilities for the RiseRoutes platform. It powers business model classification, audience insights extraction, and targeting recommendations generation.

**Requirements Implemented:** 2.1, 2.2, 2.4

## Architecture

### Components

1. **AIReasoningEngine Class**: Main service class that manages OpenAI API interactions
2. **PromptTemplates Class**: Static class containing specialized prompt templates for different analysis tasks
3. **Response Validators**: Methods that ensure AI responses conform to expected data structures

### Key Features

- ✅ OpenAI GPT-4 Turbo integration
- ✅ Structured JSON response parsing
- ✅ Automatic retry logic with exponential backoff
- ✅ Response validation and sanitization
- ✅ Comprehensive error handling
- ✅ Token usage tracking
- ✅ Confidence scoring

## Configuration

### Environment Variables

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

The API key must be set in your `.env` file. The service will throw an error if the key is not configured.

### Model Configuration

```typescript
model: 'gpt-4-turbo-preview'
maxTokens: 2000
temperature: 0.7
```

These settings can be adjusted in the `AIReasoningEngine` class constructor.

## Usage

### Import the Service

```typescript
import { aiReasoningEngine } from './services/aiReasoningEngine.js'
```

### Check Configuration

```typescript
if (!aiReasoningEngine.isConfigured()) {
  throw new Error('OpenAI API key not configured')
}
```

### Business Model Analysis

Analyzes website content to determine the business model type.

```typescript
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
  console.log('Description:', result.data.description)
  console.log('Confidence:', result.data.confidence)
  console.log('Reasoning:', result.reasoning)
}
```

**Response Structure:**
```typescript
{
  success: true,
  data: {
    type: 'B2B SaaS',
    description: 'Software-as-a-Service targeting business customers',
    confidence: 0.85
  },
  reasoning: 'The website shows clear indicators of...',
  confidence: 0.85,
  tokensUsed: 1234
}
```

### Audience Insights Analysis

Extracts detailed audience insights including demographics, psychographics, pain points, goals, and behaviors.

```typescript
const websiteContent = {
  url: 'https://example.com',
  title: 'Example Business',
  businessModel: { type: 'B2B SaaS', description: '...', confidence: 0.85 },
  valuePropositions: [
    { proposition: 'Save time', category: 'efficiency', strength: 0.9 }
  ],
  text: 'Full website text content...'
}

const result = await aiReasoningEngine.analyzeAudienceInsights(websiteContent)

if (result.success) {
  console.log('Demographics:', result.data.demographics)
  console.log('Pain Points:', result.data.pain_points)
  console.log('Goals:', result.data.goals)
}
```

**Response Structure:**
```typescript
{
  success: true,
  data: {
    demographics: {
      age_ranges: ['25-34', '35-44'],
      genders: ['all'],
      locations: ['United States', 'Urban areas'],
      job_titles: ['Marketing Manager', 'Business Owner'],
      income_level: 'Middle to Upper income'
    },
    psychographics: {
      interests: ['Technology', 'Business Growth'],
      values: ['Innovation', 'Efficiency'],
      lifestyle: 'Professional, busy, tech-savvy'
    },
    pain_points: ['Struggling with inefficient processes'],
    goals: ['Increase productivity'],
    behaviors: ['Actively researching solutions online']
  },
  reasoning: 'Analysis explanation...',
  confidence: 0.85,
  tokensUsed: 1456
}
```

### Meta Ads Targeting Recommendations

Generates specific Meta (Facebook/Instagram) Ads targeting recommendations.

```typescript
const audienceInsights = {
  demographics: { age_ranges: ['25-34'], job_titles: ['Manager'] },
  psychographics: { interests: ['Technology'] },
  pain_points: ['Wasting time on manual tasks'],
  goals: ['Increase productivity']
}

const result = await aiReasoningEngine.generateMetaTargeting(
  websiteContent,
  audienceInsights
)

if (result.success) {
  console.log('Demographics:', result.data.demographics)
  console.log('Interests:', result.data.interests)
  console.log('Behaviors:', result.data.behaviors)
  console.log('Custom Audiences:', result.data.custom_audiences)
}
```

**Response Structure:**
```typescript
{
  success: true,
  data: {
    demographics: {
      age_ranges: ['25-34', '35-44'],
      genders: ['all'],
      locations: ['United States', 'Canada']
    },
    interests: [
      {
        category: 'Business and Industry',
        specific_interests: ['Small business', 'Entrepreneurship'],
        reasoning: 'These interests align with the target audience'
      }
    ],
    behaviors: [
      {
        behavior: 'Small business owners',
        reasoning: 'Direct match with the target customer profile'
      }
    ],
    custom_audiences: [
      {
        type: 'Website visitors (past 30 days)',
        description: 'People who visited but didn\'t convert',
        reasoning: 'Retarget warm leads'
      }
    ],
    lookalike_suggestions: [
      {
        source: 'Email list subscribers',
        percentage: 1,
        reasoning: 'Find similar users to existing audience'
      }
    ]
  },
  reasoning: 'Overall targeting strategy explanation...',
  confidence: 0.85,
  tokensUsed: 1678
}
```

### Google Ads Targeting Recommendations

Generates Google Ads targeting recommendations with intent-based keyword clusters.

```typescript
const result = await aiReasoningEngine.generateGoogleTargeting(
  websiteContent,
  audienceInsights
)

if (result.success) {
  console.log('Keyword Clusters:', result.data.keyword_clusters)
  console.log('Audiences:', result.data.audiences)
  console.log('Placements:', result.data.placements)
}
```

**Response Structure:**
```typescript
{
  success: true,
  data: {
    keyword_clusters: [
      {
        intent: 'Problem-aware: Looking for solutions',
        keywords: [
          {
            keyword: 'business management software',
            match_type: 'phrase',
            estimated_volume: 'high'
          }
        ],
        reasoning: 'Users searching these terms are actively looking for solutions'
      }
    ],
    audiences: [
      {
        type: 'In-Market: Business Services',
        description: 'Users actively researching business software',
        reasoning: 'High intent audience ready to make purchase decisions'
      }
    ],
    demographics: {
      age_ranges: ['25-34', '35-44'],
      genders: ['all'],
      household_income: ['top 30%']
    },
    placements: [
      {
        type: 'YouTube channels',
        examples: ['Business education channels'],
        reasoning: 'Reach audience where they consume relevant content'
      }
    ]
  },
  reasoning: 'Overall keyword and targeting strategy...',
  confidence: 0.85,
  tokensUsed: 1890
}
```

### Value Proposition Extraction

Extracts and analyzes value propositions from website content.

```typescript
const result = await aiReasoningEngine.extractValuePropositions(websiteContent)

if (result.success) {
  console.log('Value Propositions:', result.data)
}
```

### Content Theme Analysis

Analyzes content themes and messaging patterns.

```typescript
const result = await aiReasoningEngine.analyzeContentThemes(websiteContent)

if (result.success) {
  console.log('Themes:', result.data)
}
```

## Prompt Templates

The service includes specialized prompt templates for each analysis type:

### Available Templates

1. **businessModelAnalysis**: Identifies business model type and characteristics
2. **audienceInsightsAnalysis**: Extracts comprehensive audience insights
3. **metaTargetingRecommendations**: Generates Meta Ads targeting recommendations
4. **googleTargetingRecommendations**: Generates Google Ads targeting with intent-based keywords
5. **valuePropositionExtraction**: Extracts and categorizes value propositions
6. **contentThemeAnalysis**: Identifies content themes and messaging patterns

### Custom Prompts

You can access prompt templates directly:

```typescript
import { PromptTemplates } from './services/aiReasoningEngine.js'

const prompt = PromptTemplates.businessModelAnalysis(websiteContent)
console.log(prompt)
```

## Error Handling

The service includes comprehensive error handling:

### Automatic Retries

Failed API calls are automatically retried up to 3 times with exponential backoff:

```typescript
// Retry delays: 1s, 2s, 3s
private async executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T>
```

### Error Response Format

When an error occurs, the response includes error details:

```typescript
{
  success: false,
  data: null,
  confidence: 0,
  error: 'Error message describing what went wrong'
}
```

### Common Errors

1. **Missing API Key**: `OpenAI API key not configured`
2. **API Rate Limit**: Automatically retried with backoff
3. **Invalid Response**: `Invalid [type] response format`
4. **Network Error**: Retried up to 3 times

## Response Validation

All AI responses are validated to ensure they conform to expected structures:

### Validation Methods

- `validateBusinessModelResponse()`: Ensures business model data is valid
- `validateAudienceInsightsResponse()`: Validates audience insights structure
- `validateMetaTargetingResponse()`: Validates Meta targeting recommendations
- `validateGoogleTargetingResponse()`: Validates Google targeting recommendations
- `validateValuePropositionsResponse()`: Validates value propositions array
- `validateContentThemesResponse()`: Validates content themes array

### Validation Benefits

- **Type Safety**: Ensures responses match TypeScript interfaces
- **Default Values**: Provides sensible defaults for missing fields
- **Error Prevention**: Catches malformed responses before they cause issues
- **Data Consistency**: Guarantees consistent data structures across the application

## Performance Considerations

### Token Usage

The service tracks token usage for each API call:

```typescript
const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)
console.log('Tokens used:', result.tokensUsed)
```

### Content Truncation

Large content is automatically truncated to stay within token limits:

- Business model analysis: 2000 characters
- Audience insights: 2000 characters
- Value propositions: 3000 characters
- Content themes: 3000 characters

### Caching Recommendations

Consider caching AI analysis results to reduce API calls:

```typescript
// Check cache first
const cached = await cache.get(`analysis:${url}`)
if (cached) return cached

// Perform analysis
const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)

// Cache result
await cache.set(`analysis:${url}`, result, 3600) // 1 hour TTL
```

## Best Practices

### 1. Always Check Configuration

```typescript
if (!aiReasoningEngine.isConfigured()) {
  throw new Error('OpenAI not configured')
}
```

### 2. Handle Errors Gracefully

```typescript
const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)

if (!result.success) {
  logger.error('AI analysis failed:', result.error)
  // Fall back to rule-based analysis
  return fallbackAnalysis(websiteContent)
}
```

### 3. Validate Input Data

```typescript
if (!websiteContent.text || websiteContent.text.length < 100) {
  throw new Error('Insufficient content for analysis')
}
```

### 4. Monitor Token Usage

```typescript
const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)
logger.info(`Analysis complete. Tokens used: ${result.tokensUsed}`)

// Alert if usage is high
if (result.tokensUsed && result.tokensUsed > 1500) {
  logger.warn('High token usage detected')
}
```

### 5. Use Confidence Scores

```typescript
const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)

if (result.confidence < 0.6) {
  logger.warn('Low confidence analysis, consider manual review')
}
```

## Testing

### Unit Testing

```typescript
import { aiReasoningEngine } from './aiReasoningEngine.js'

describe('AIReasoningEngine', () => {
  it('should analyze business model', async () => {
    const websiteContent = {
      url: 'https://example.com',
      title: 'Test Business',
      text: 'Sample content...',
      headings: ['Heading 1']
    }

    const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('type')
    expect(result.data).toHaveProperty('confidence')
  })
})
```

### Integration Testing

Test with real OpenAI API calls in a controlled environment:

```typescript
// Set test API key
process.env.OPENAI_API_KEY = 'test-key'

// Run integration tests
npm test -- --grep "AI Integration"
```

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution**: Set the `OPENAI_API_KEY` environment variable in your `.env` file.

### Issue: API calls timing out

**Solution**: Check your network connection and OpenAI API status. The service will automatically retry failed requests.

### Issue: Invalid response format

**Solution**: The validation methods will provide default values. Check logs for details about what was invalid.

### Issue: High token usage

**Solution**: Reduce the amount of content sent to the API by truncating text or summarizing before analysis.

## Future Enhancements

Potential improvements for future versions:

1. **Streaming Responses**: Support for streaming API responses for real-time updates
2. **Custom Models**: Allow configuration of different OpenAI models
3. **Batch Processing**: Process multiple analyses in parallel
4. **Response Caching**: Built-in caching layer to reduce API calls
5. **Fine-tuned Models**: Support for custom fine-tuned models
6. **Multi-language Support**: Analyze websites in different languages
7. **Advanced Validation**: More sophisticated response validation with schema validation libraries

## Related Documentation

- [Website Analyzer Service](./websiteAnalyzer.ts)
- [Business Model Classifier](./businessModelClassifier.ts)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Requirements Document](../../../.kiro/specs/ai-ads-intelligence-platform/requirements.md)
- [Design Document](../../../.kiro/specs/ai-ads-intelligence-platform/design.md)

## Support

For issues or questions about the AI Reasoning Engine:

1. Check the logs for detailed error messages
2. Verify OpenAI API key configuration
3. Review the prompt templates for customization
4. Consult the OpenAI API documentation for rate limits and best practices
