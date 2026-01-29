# Testing the Improvements

## What Changed

### 1. Dynamic Real Data (No More Demo Data)
- System now uses REAL website content when AI fails
- Extracts actual headings, paragraphs, CTAs from your website
- Generates targeting based on what's actually on the page

### 2. Auto-Switching AI Models
- Automatically tries 2 different AI models if first one fails
- 7 fallback models available (was 4)
- Smart model selection based on failure history

## How to Test

### Test 1: Normal Analysis (Should Work)
```bash
# Analyze a website - should get AI-powered results
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://stripe.com",
    "target_location": "United States"
  }'
```

**Expected Result:**
- ✅ AI model generates targeting
- ✅ Recommendations based on Stripe's actual content
- ✅ Interests like "Payment processing", "E-commerce platforms"
- ✅ Keywords like "payment gateway", "online payments"

### Test 2: With Keywords (Keyword-Focused)
```bash
# Analyze with specific keywords
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://stripe.com",
    "target_location": "United States",
    "keywords": "payment processing, online checkout, payment gateway"
  }'
```

**Expected Result:**
- ✅ EXACTLY 10 audiences focused on payment processing
- ✅ EXACTLY 10 interests related to online payments
- ✅ EXACTLY 10 behaviors showing purchase intent
- ✅ All recommendations tied to the keywords provided

### Test 3: Check Logs for Model Switching
```bash
# Watch the backend logs in real-time
tail -f backend/logs/combined.log
```

**Look for these messages:**

**Success with primary model:**
```
✅ OpenRouter API call successful. Model: openai/gpt-oss-20b:free, Tokens: 1234
```

**Auto-switching to fallback:**
```
❌ OpenRouter API call failed with model openai/gpt-oss-20b:free
⚠️ Rate limit hit on openai/gpt-oss-20b:free, switching to next available model...
Calling OpenRouter API with creative model (attempt 2): mistralai/devstral-2:free
✅ OpenRouter API call successful. Model: mistralai/devstral-2:free
```

**Fallback to real data:**
```
❌ All available creative models failed after 2 attempts
Using real website data for Meta targeting generation
Meta targeting generated for session: abc-123
```

## What You'll See in Dashboard

### Before (Old System - Demo Data):
```json
{
  "interests": [
    {
      "category": "Technology",
      "interests": ["Business software", "Cloud computing", "SaaS"],
      "confidence": 0.80,
      "reasoning": "SaaS business model detected from website structure"
    }
  ]
}
```
❌ Generic, not specific to the actual website

### After (New System - Real Data):
```json
{
  "interests": [
    {
      "category": "Business and industry",
      "interests": ["Payment processing", "E-commerce platforms", "Online payments"],
      "confidence": 0.92,
      "reasoning": "Website explicitly mentions payment processing based on heading 'Accept Payments Online' and features 'Fast checkout', 'Secure transactions'",
      "evidence": "Direct mention in hero section and multiple CTAs for payment solutions"
    }
  ]
}
```
✅ Specific to Stripe's actual content and features

## Verify Real Data Extraction

### Check what data is being extracted:
```bash
# Make a request and check the database
curl -X POST http://localhost:3000/api/analysis \
  -H "Content-Type: application/json" \
  -d '{"website_url": "https://stripe.com"}' \
  | jq '.session_id'

# Then check the database for that session
# You should see real extracted data in technical_metadata:
# - headings: ["Accept payments online", "Built for developers", ...]
# - paragraphs: ["Stripe is a financial infrastructure...", ...]
# - ctas: ["Get started", "Contact sales", ...]
```

## Available Free AI Models

The system will automatically try these high-performance models in order (all support 20 req/min):

### Analysis Models (for understanding):
1. `openai/gpt-oss-20b:free` (Primary) - OpenAI MoE model with high-efficiency reasoning
2. `mistralai/devstral-2:free` - 123B parameters, 256K context window, specialized in analysis
3. `deepseek/deepseek-tng-r1t2-chimera:free` - High-performance fast reasoning
4. `cognitivecomputations/dolphin-mistral-24b:free` - Uncensored research model
5. `google/gemini-2.0-flash-exp:free` - Google's latest flash model
6. `meta-llama/llama-3.3-70b-instruct:free` - Excellent reasoning capabilities
7. `qwen/qwen-2.5-72b-instruct:free` - Strong analytical capabilities
8. `google/gemini-flash-1.5:free` - Stable Google alternative

### Creative Models (for generating recommendations):
1. `openai/gpt-oss-20b:free` (Primary) - OpenAI MoE for structured outputs
2. `mistralai/devstral-2:free` - 123B params, excellent for agentic coding
3. `deepseek/deepseek-tng-r1t2-chimera:free` - Fast reasoning and generation
4. `cognitivecomputations/dolphin-mistral-24b:free` - Flexible research model
5. `google/gemini-2.0-flash-exp:free` - Best for JSON output
6. `meta-llama/llama-3.3-70b-instruct:free` - Great for structured output
7. `qwen/qwen-2.5-72b-instruct:free` - Excellent at following instructions
8. `meta-llama/llama-3.1-8b-instruct:free` - Fast and reliable

## Success Indicators

✅ **Working Correctly If You See:**
- Different model names in logs when rate limited
- "Using real website data" message when all AI fails
- Specific interests/keywords related to actual website content
- Confidence scores with evidence from website
- No generic "Business" or "Technology" interests

❌ **Problem If You See:**
- Same model tried 3+ times without switching
- "Using template-based generation" in logs
- Generic interests not related to website
- No evidence or reasoning in recommendations

## Quick Visual Test

1. Go to http://localhost:5173
2. Enter a website URL (e.g., https://stripe.com)
3. Add keywords: "payment processing, checkout"
4. Click Analyze
5. Check the dashboard results

**You should see:**
- ✅ Interests specifically about payment processing
- ✅ Keywords like "payment gateway", "online checkout"
- ✅ Behaviors like "E-commerce business owners"
- ✅ Evidence from actual website content
- ✅ NOT generic "Business software" or "Technology"

## Troubleshooting

### If you still see generic data:
1. Check logs: `tail -f backend/logs/combined.log`
2. Look for "Using real website data" message
3. Verify website content was extracted (check technical_metadata in DB)
4. Ensure OpenRouter API key is set in .env

### If all AI models fail:
1. Check OpenRouter API key: `echo $OPENAI_API_KEY`
2. Verify internet connection
3. Check OpenRouter status: https://openrouter.ai/status
4. System will still work with real data fallback!

## Summary

The system now provides **3 levels of quality**:

1. **Best:** AI-powered analysis with primary model
2. **Good:** AI-powered analysis with fallback model (auto-switched)
3. **Acceptable:** Real website data analysis (when all AI fails)

**You will NEVER see generic demo/template data anymore!**
