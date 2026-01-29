# OpenAI API Setup Guide

## Quick Setup (2 minutes)

### Step 1: Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 2: Add Key to Backend
```bash
# Edit backend/.env file
cd backend
nano .env  # or use any text editor
```

Replace this line:
```
OPENAI_API_KEY=your_openai_api_key
```

With your actual key:
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### Step 3: Restart Backend Server
```bash
# Stop the current server (Ctrl+C if running)
# Then restart:
npm run dev
```

## Cost Estimate

With GPT-4 Turbo:
- **Per Analysis**: ~$0.10 - $0.30
- **Tokens Used**: ~2,000 - 6,000 tokens
- **API Calls**: 3-5 calls per analysis

### What Gets Analyzed:
1. Business model classification
2. Audience insights extraction
3. Meta Ads targeting generation
4. Google Ads targeting generation
5. Value propositions (optional)

## Verify It's Working

After setup, analyze a website. Check backend logs:
```bash
tail -f backend/logs/combined.log
```

You should see:
```
✓ OpenAI client initialized
✓ Calling OpenAI API...
✓ OpenAI API call successful. Tokens used: 2,450
```

## Fallback Behavior

If OpenAI key is not configured or API fails:
- System automatically falls back to template-based generation
- You'll see: "Using template-based targeting generation"
- No errors, but recommendations will be generic

## Troubleshooting

### "OpenAI API key not configured"
- Check `.env` file has the correct key
- Restart backend server
- Key should start with `sk-`

### "Insufficient quota"
- Add credits to your OpenAI account
- Go to https://platform.openai.com/account/billing

### "Rate limit exceeded"
- Wait a few seconds between analyses
- Upgrade your OpenAI plan if needed

## Testing Without OpenAI

The platform works without OpenAI (using templates), but you won't get:
- Real AI analysis of website content
- Personalized targeting recommendations
- Confidence scores based on actual analysis
- "Why this matters" reasoning from AI

**Recommendation**: Add OpenAI key for real value!
