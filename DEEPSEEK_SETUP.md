# DeepSeek API Setup Guide

## Overview

DeepSeek is now integrated as the **primary AI provider** for the AI-powered Ads Intelligence Platform. It offers fast, affordable, and high-quality AI models for business analysis and targeting recommendations.

## Priority Order

The system uses the following provider priority order (with automatic fallback):

1. **DeepSeek** (Primary - Fast & Affordable)
2. **Gemini** (Fallback #1)
3. **OpenAI** (Fallback #2)
4. **OpenRouter** (Fallback #3)

## Available DeepSeek Models

### Analysis Tasks
- `deepseek-chat` - General purpose chat model
- `deepseek-reasoner` - Advanced reasoning model

### Creative Tasks
- `deepseek-chat` - General purpose chat model
- `deepseek-reasoner` - Advanced reasoning model

## Configuration

### 1. Get Your API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/api_keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key (starts with `sk-`)

### 2. Add to Environment Variables

Edit `backend/.env` and add:

```bash
# AI Provider Configuration
AI_PROVIDER=deepseek

# DeepSeek Configuration
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

### 3. Restart Backend Server

```bash
cd backend
npm run dev
```

## Features

### Automatic Fallback Chain

If DeepSeek is unavailable or fails, the system automatically falls back to:
- Gemini (if configured)
- OpenAI (if configured)
- OpenRouter (if configured)

### Multi-Model Support

The system tries multiple models within each provider before moving to the next provider:

**DeepSeek Models:**
1. deepseek-chat
2. deepseek-reasoner

### API Endpoint

DeepSeek uses the OpenAI-compatible API format:
- Base URL: `https://api.deepseek.com`
- Authentication: Bearer token (API key)

## Usage

### Automatic (Recommended)

The system automatically uses DeepSeek when `AI_PROVIDER=deepseek` is set in `.env`:

```bash
# Analysis will use DeepSeek automatically
POST /api/analysis/analyze
```

### Manual Provider Selection

You can also specify DeepSeek explicitly in API calls:

```typescript
// In your code
const result = await aiReasoningEngine.analyzeBusinessModel(
  websiteContent,
  'deepseek',  // provider
  'deepseek-chat'  // model (optional)
)
```

## Supported Analysis Types

DeepSeek is used for all AI analysis tasks:

1. **Business Model Analysis** - Identify business type and model
2. **Audience Insights** - Demographics, psychographics, pain points
3. **Value Propositions** - Extract key value propositions
4. **Content Themes** - Analyze content themes and keywords
5. **Meta Targeting** - Generate Facebook/Instagram ad targeting
6. **Google Targeting** - Generate Google Ads targeting recommendations
7. **Keyword-Focused Targeting** - Generate targeting based on specific keywords

## Testing

### Test DeepSeek Integration

```bash
# Run the test script
node test-deepseek-simple.ts
```

### Check Available Models

```bash
curl http://localhost:3000/api/analysis/models
```

Expected response:
```json
{
  "deepseek": {
    "available": true,
    "models": ["deepseek-chat", "deepseek-reasoner"]
  },
  "gemini": {
    "available": true,
    "models": ["gemini-2.5-flash", "gemini-1.5-flash"]
  },
  ...
}
```

## Pricing

DeepSeek offers competitive pricing:
- **deepseek-chat**: $0.14 per 1M input tokens, $0.28 per 1M output tokens
- **deepseek-reasoner**: $0.55 per 1M input tokens, $2.19 per 1M output tokens

(Check [DeepSeek Pricing](https://platform.deepseek.com/pricing) for current rates)

## Troubleshooting

### DeepSeek Not Working

1. **Check API Key**: Ensure `DEEPSEEK_API_KEY` is set in `backend/.env`
2. **Check Provider**: Ensure `AI_PROVIDER=deepseek` in `backend/.env`
3. **Check Logs**: Look for DeepSeek initialization messages in backend logs
4. **Test Connection**: Run the test script to verify connectivity

### Fallback to Other Providers

If you see messages like "DeepSeek failed, trying Gemini...", this is normal behavior. The system will automatically use the next available provider.

### API Rate Limits

If you hit rate limits:
1. Check your DeepSeek account usage
2. Consider upgrading your plan
3. The system will automatically fall back to other providers

## Benefits of DeepSeek

1. **Fast Response Times** - Quick analysis results
2. **Affordable Pricing** - Cost-effective compared to other providers
3. **High Quality** - Excellent results for business analysis
4. **OpenAI Compatible** - Easy integration with existing code
5. **Automatic Fallback** - Seamless failover to other providers

## Current Configuration

Your system is configured with:
- **API Key**: `sk-17cd3e167a014900a727d6e6e21a39bb`
- **Provider**: `deepseek`
- **Models**: `deepseek-chat`, `deepseek-reasoner`

## Next Steps

1. ✅ DeepSeek API key configured
2. ✅ Environment variables updated
3. ✅ Integration code complete
4. 🔄 Restart backend server
5. 🧪 Test the integration
6. 🚀 Start using DeepSeek for analysis

## Support

- **DeepSeek Documentation**: https://platform.deepseek.com/docs
- **API Reference**: https://platform.deepseek.com/api-docs
- **Community**: https://github.com/deepseek-ai

---

**Status**: ✅ DeepSeek integration complete and ready to use!
