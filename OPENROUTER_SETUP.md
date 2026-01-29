# OpenRouter Setup Guide

This application uses **OpenRouter** to access AI models (Claude 3.5 Sonnet) for intelligent targeting analysis.

## Why OpenRouter?

- Access to multiple AI models through one API
- More affordable than direct OpenAI API
- Better rate limits and reliability
- Supports Claude, GPT-4, and many other models

## Setup Instructions

### 1. Get Your OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Click "Create Key"
5. Copy your API key (starts with `sk-or-v1-...`)

### 2. Add Credits to Your Account

1. Go to [Credits](https://openrouter.ai/credits)
2. Add at least $5 to start (recommended: $10-20)
3. OpenRouter charges per token used

### 3. Configure the Backend

Add your OpenRouter API key to `backend/.env`:

```bash
# In backend/.env
OPENAI_API_KEY=sk-or-v1-your-openrouter-key-here
```

**Note:** We use `OPENAI_API_KEY` as the variable name because OpenRouter is compatible with the OpenAI SDK.

### 4. Restart the Backend Server

```bash
cd backend
npm run dev
```

## Current Model Configuration

**Smart Model Selection with Automatic Fallback:**

The system uses a primary model with automatic fallback to ensure reliability:

- **Primary Model:** `google/gemini-2.0-flash-exp:free`
  - Best free model for structured JSON output
  - 4000 token context
  - Excellent for marketing analysis

- **Fallback Models (automatic):**
  1. `meta-llama/llama-3.1-8b-instruct:free` - Fast and reliable
  2. `mistralai/mistral-7b-instruct:free` - Stable fallback
  3. `google/gemini-flash-1.5:free` - Proven Google model

**How It Works:**
- System tries primary model first
- If rate limited (429 error), automatically switches to next available fallback
- Tracks failures per model and rotates intelligently
- Resets failure counts after successful calls
- Ensures maximum uptime with free models

## Cost Estimates

With Claude 3.5 Sonnet via OpenRouter:

- **Input:** ~$3 per 1M tokens
- **Output:** ~$15 per 1M tokens
- **Per Analysis:** ~$0.05-$0.15 (much cheaper than direct OpenAI)

Example: $10 credit = ~100-200 website analyses

## Switching Models

You can change the model in `backend/src/services/aiReasoningEngine.ts`:

```typescript
private readonly model = 'anthropic/claude-3.5-sonnet' // Current
// Or try:
// private readonly model = 'openai/gpt-4-turbo'
// private readonly model = 'google/gemini-pro'
// private readonly model = 'meta-llama/llama-3-70b-instruct'
```

See all available models at [OpenRouter Models](https://openrouter.ai/models)

## Testing Your Setup

1. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. Open http://localhost:5173

3. Enter a website URL and click "Analyze My Website"

4. Check backend logs for:
   ```
   OpenRouter client initialized
   Calling OpenRouter API...
   OpenRouter API call successful
   ```

## Troubleshooting

### "OpenRouter API key not configured"
- Make sure `OPENAI_API_KEY` is set in `backend/.env`
- Restart the backend server after adding the key

### "Insufficient credits"
- Add more credits at https://openrouter.ai/credits
- Check your usage at https://openrouter.ai/activity

### "Rate limit exceeded"
- OpenRouter has generous rate limits
- Wait a few seconds and try again
- Consider upgrading your OpenRouter plan

### API calls failing
- Check your API key is correct
- Verify you have credits in your account
- Check backend logs for detailed error messages

## Fallback Behavior

If OpenRouter is not configured or fails:
- The system will fall back to template-based targeting
- You'll still get results, but they won't be AI-powered
- Check backend logs to see if AI is being used

## Security Notes

- Never commit your API key to git
- Keep your `.env` file private
- Rotate your API key if it's exposed
- Monitor your usage at https://openrouter.ai/activity
