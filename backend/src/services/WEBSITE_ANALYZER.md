# Website Analyzer Service

## Overview

The Website Analyzer Service is a core component of the RiseRoutes AI Ads Intelligence Platform that analyzes websites to extract content, metadata, and business insights. It validates URLs, scrapes content using Puppeteer, and extracts structured data for targeting recommendations.

**Requirements:** 1.1, 1.2

## Features

### 1. URL Validation and Accessibility Checking (Requirement 1.1)

- **URL Format Validation**: Validates URL structure and format
- **Protocol Normalization**: Automatically adds HTTPS protocol if missing
- **Accessibility Checking**: Verifies that URLs are accessible before analysis
- **Response Time Tracking**: Measures website response times

### 2. Web Scraping with Puppeteer (Requirement 1.2)

- **Headless Browser**: Uses Puppeteer for JavaScript-rendered content
- **Content Extraction**: Extracts HTML, text, headings, links, and images
- **Structured Data**: Parses JSON-LD and other structured data formats
- **Configurable Timeouts**: Supports custom timeout and wait conditions

### 3. Content Extraction and Metadata Parsing (Requirement 1.2)

- **Technical Metadata**: Extracts title, description, keywords, and Open Graph tags
- **Business Model Classification**: Identifies business type (SaaS, e-commerce, service, etc.)
- **Value Propositions**: Extracts key value propositions from headings and content
- **Content Themes**: Identifies main content themes and keywords
- **Audience Insights**: Extracts pain points, goals, and behaviors

## API Reference

### Main Methods

#### `analyzeWebsite(url: string, sessionId: string, options?: AnalysisOptions): Promise<CreateWebsiteAnalysisInput>`

Main analysis method that orchestrates all analysis steps.

**Parameters:**
- `url` (string): Website URL to analyze
- `sessionId` (string): Analysis session ID for database storage
- `options` (AnalysisOptions, optional): Configuration options

**Returns:** Promise<CreateWebsiteAnalysisInput> - Complete website analysis data

**Example:**
```typescript
const analysis = await websiteAnalyzer.analyzeWebsite(
  'https://example.com',
  'session-123',
  { timeout: 30000 }
)
```

#### `validateUrl(url: string): URLValidationResult`

Validates URL format and structure.

**Parameters:**
- `url` (string): URL to validate

**Returns:** URLValidationResult with validation status and normalized URL

**Example:**
```typescript
const result = websiteAnalyzer.validateUrl('example.com')
// { isValid: true, normalizedUrl: 'https://example.com/' }
```

#### `checkAccessibility(url: string): Promise<AccessibilityCheckResult>`

Checks if URL is accessible.

**Parameters:**
- `url` (string): URL to check

**Returns:** Promise<AccessibilityCheckResult> with accessibility status

**Example:**
```typescript
const result = await websiteAnalyzer.checkAccessibility('https://example.com')
// { isAccessible: true, statusCode: 200, responseTime: 245 }
```

#### `extractContent(url: string, options?: AnalysisOptions): Promise<WebsiteContent>`

Extracts content from website using Puppeteer.

**Parameters:**
- `url` (string): Website URL
- `options` (AnalysisOptions, optional): Extraction options

**Returns:** Promise<WebsiteContent> with extracted content

**Example:**
```typescript
const content = await websiteAnalyzer.extractContent('https://example.com', {
  timeout: 30000,
  maxContentLength: 50000
})
```

### Analysis Methods

#### `identifyBusinessModel(content: WebsiteContent): BusinessModel`

Identifies business model from website content.

**Returns:** BusinessModel with type, description, and confidence score

**Supported Business Models:**
- SaaS (Software as a Service)
- E-commerce
- Service Business
- Marketplace
- Agency
- Education
- Media/Content
- Nonprofit

#### `extractValuePropositions(content: WebsiteContent): ValueProposition[]`

Extracts value propositions from headings and content.

**Returns:** Array of ValueProposition objects with category and strength

#### `identifyContentThemes(content: WebsiteContent): ContentTheme[]`

Identifies main content themes and keywords.

**Returns:** Array of ContentTheme objects with keywords and relevance scores

#### `extractAudienceInsights(content: WebsiteContent): AudienceInsights`

Extracts audience signals including pain points, goals, and behaviors.

**Returns:** AudienceInsights object

#### `extractTechnicalMetadata(content: WebsiteContent): TechnicalMetadata`

Extracts technical metadata including SEO tags and structured data.

**Returns:** TechnicalMetadata object

## Types and Interfaces

### AnalysisOptions

```typescript
interface AnalysisOptions {
  timeout?: number              // Request timeout in milliseconds (default: 30000)
  waitForSelector?: string      // CSS selector to wait for before extraction
  includeScreenshot?: boolean   // Whether to capture screenshot
  maxContentLength?: number     // Maximum content length to extract (default: 50000)
}
```

### WebsiteContent

```typescript
interface WebsiteContent {
  url: string
  html: string
  text: string
  title: string
  description: string
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  links: string[]
  images: string[]
  metadata: Record<string, string>
  structuredData: any[]
}
```

### URLValidationResult

```typescript
interface URLValidationResult {
  isValid: boolean
  normalizedUrl?: string
  error?: string
}
```

### AccessibilityCheckResult

```typescript
interface AccessibilityCheckResult {
  isAccessible: boolean
  statusCode?: number
  responseTime?: number
  error?: string
}
```

## Usage Examples

### Basic Website Analysis

```typescript
import { websiteAnalyzer } from './services/websiteAnalyzer.js'

// Analyze a website
const analysis = await websiteAnalyzer.analyzeWebsite(
  'https://example.com',
  'session-123'
)

console.log('Business Model:', analysis.business_model)
console.log('Value Propositions:', analysis.value_propositions)
console.log('Target Audience:', analysis.target_audience)
```

### URL Validation Before Analysis

```typescript
// Validate URL first
const validation = websiteAnalyzer.validateUrl('example.com')

if (!validation.isValid) {
  console.error('Invalid URL:', validation.error)
  return
}

// Check accessibility
const accessibility = await websiteAnalyzer.checkAccessibility(
  validation.normalizedUrl!
)

if (!accessibility.isAccessible) {
  console.error('URL not accessible:', accessibility.error)
  return
}

// Proceed with analysis
const analysis = await websiteAnalyzer.analyzeWebsite(
  validation.normalizedUrl!,
  'session-123'
)
```

### Custom Analysis Options

```typescript
// Analyze with custom options
const analysis = await websiteAnalyzer.analyzeWebsite(
  'https://example.com',
  'session-123',
  {
    timeout: 60000,              // 60 second timeout
    waitForSelector: '.main-content',  // Wait for specific element
    maxContentLength: 100000     // Extract up to 100KB of content
  }
)
```

### Content-Only Extraction

```typescript
// Extract content without full analysis
const content = await websiteAnalyzer.extractContent('https://example.com')

// Analyze specific aspects
const businessModel = websiteAnalyzer.identifyBusinessModel(content)
const valueProps = websiteAnalyzer.extractValuePropositions(content)
const themes = websiteAnalyzer.identifyContentThemes(content)
```

## Error Handling

The service handles various error scenarios:

### Invalid URL Format

```typescript
const validation = websiteAnalyzer.validateUrl('not-a-url')
// { isValid: false, error: 'Invalid URL format' }
```

### Inaccessible Website

```typescript
try {
  const analysis = await websiteAnalyzer.analyzeWebsite('https://invalid-site.com', 'session-123')
} catch (error) {
  console.error('Analysis failed:', error.message)
  // "URL not accessible: ..."
}
```

### Timeout Errors

```typescript
try {
  const analysis = await websiteAnalyzer.analyzeWebsite(
    'https://slow-site.com',
    'session-123',
    { timeout: 5000 }  // Short timeout
  )
} catch (error) {
  console.error('Timeout:', error.message)
}
```

## Performance Considerations

### Browser Management

The service uses a singleton browser instance that is reused across requests:

```typescript
// Browser is initialized on first use
const analysis1 = await websiteAnalyzer.analyzeWebsite(url1, 'session-1')

// Same browser instance is reused
const analysis2 = await websiteAnalyzer.analyzeWebsite(url2, 'session-2')

// Close browser when done (optional, for cleanup)
await websiteAnalyzer.closeBrowser()
```

### Content Length Limits

To prevent memory issues, content extraction is limited:

- Default max content length: 50,000 characters
- Default max links: 100
- Default max images: 50

Adjust these limits using `AnalysisOptions`:

```typescript
const analysis = await websiteAnalyzer.analyzeWebsite(url, sessionId, {
  maxContentLength: 100000  // Increase limit if needed
})
```

### Timeout Configuration

Default timeout is 30 seconds. Adjust based on website complexity:

```typescript
// For simple static sites
{ timeout: 15000 }

// For complex JavaScript-heavy sites
{ timeout: 60000 }
```

## Testing

### Unit Tests

Run unit tests with:

```bash
npm test websiteAnalyzer.test.ts
```

### Verification Script

Run the verification script to test core functionality:

```bash
npx tsx src/services/websiteAnalyzer.verify.ts
```

### Manual Testing

Test with real websites:

```typescript
import { websiteAnalyzer } from './services/websiteAnalyzer.js'

// Test with various website types
const sites = [
  'https://stripe.com',      // SaaS
  'https://amazon.com',      // E-commerce
  'https://hubspot.com',     // Service
]

for (const url of sites) {
  const analysis = await websiteAnalyzer.analyzeWebsite(url, `test-${Date.now()}`)
  console.log(`${url}: ${analysis.business_model}`)
}
```

## Integration

### With Analysis Session

```typescript
import { websiteAnalyzer } from './services/websiteAnalyzer.js'
import { WebsiteAnalysisRepository } from '../models/WebsiteAnalysisRepository.js'

// Analyze website
const analysisData = await websiteAnalyzer.analyzeWebsite(url, sessionId)

// Save to database
const repo = new WebsiteAnalysisRepository()
const savedAnalysis = await repo.create(analysisData)
```

### With Targeting Engine

```typescript
// Analyze website
const analysis = await websiteAnalyzer.analyzeWebsite(url, sessionId)

// Generate targeting recommendations
const targeting = await targetingEngine.generateRecommendations(analysis)
```

## Troubleshooting

### Puppeteer Installation Issues

If Puppeteer fails to install:

```bash
# Install Chromium manually
npx puppeteer browsers install chrome

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### Memory Issues

For large-scale analysis:

```typescript
// Close browser between batches
for (const batch of urlBatches) {
  for (const url of batch) {
    await websiteAnalyzer.analyzeWebsite(url, sessionId)
  }
  await websiteAnalyzer.closeBrowser()  // Free memory
}
```

### Slow Analysis

Optimize for speed:

```typescript
const analysis = await websiteAnalyzer.analyzeWebsite(url, sessionId, {
  timeout: 15000,           // Shorter timeout
  maxContentLength: 25000,  // Less content
  waitForSelector: undefined // Don't wait for specific elements
})
```

## Future Enhancements

Planned improvements:

1. **Screenshot Capture**: Add screenshot functionality for visual analysis
2. **Retry Logic**: Implement automatic retry with exponential backoff
3. **Caching**: Cache analysis results for frequently analyzed sites
4. **Parallel Processing**: Analyze multiple pages simultaneously
5. **Advanced NLP**: Integrate more sophisticated NLP models
6. **Performance Metrics**: Track and optimize analysis performance

## Related Services

- **Business Model Classifier**: Uses Website Analyzer output for classification
- **Targeting Engine**: Generates recommendations from analysis data
- **Competitor Intelligence**: Analyzes multiple websites for comparison

## Support

For issues or questions:

1. Check the verification script output
2. Review error logs in `logs/error.log`
3. Consult the main README.md for setup instructions
4. Check TypeScript types in `models/types.ts`
