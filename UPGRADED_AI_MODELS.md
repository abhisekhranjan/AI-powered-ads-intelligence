# Upgraded AI Models - OpenRouter Free Tier

## Overview
The system now uses OpenRouter's most powerful free models, all supporting **20 requests per minute** without cost.

## New Primary Models

### 1. OpenAI GPT-OSS-20B (Primary)
**Model ID:** `openai/gpt-oss-20b:free`

**Capabilities:**
- Mixture-of-Experts (MoE) architecture
- High-efficiency reasoning
- Excellent for structured outputs (JSON)
- Released by OpenAI specifically for research

**Best For:**
- Generating targeting recommendations
- Structured data analysis
- Complex reasoning tasks

**Rate Limit:** 20 requests/minute

---

### 2. Mistral Devstral 2 (Top Fallback)
**Model ID:** `mistralai/devstral-2:free`

**Capabilities:**
- **123 billion parameters** (massive!)
- **256K context window** (can process huge amounts of text)
- Specialized in agentic coding and complex analysis
- Excellent at following detailed instructions

**Best For:**
- Deep website content analysis
- Complex targeting strategy generation
- Long-form reasoning with lots of context

**Rate Limit:** 20 requests/minute

---

### 3. DeepSeek TNG-R1T2-Chimera
**Model ID:** `deepseek/deepseek-tng-r1t2-chimera:free`

**Capabilities:**
- High-performance reasoning
- Fast inference speed
- Excellent at structured outputs
- Strong analytical capabilities

**Best For:**
- Quick analysis tasks
- Fast targeting generation
- Efficient reasoning

**Rate Limit:** 20 requests/minute

---

### 4. Dolphin Mistral 24B
**Model ID:** `cognitivecomputations/dolphin-mistral-24b:free`

**Capabilities:**
- 24 billion parameters
- "Uncensored" model (no content restrictions)
- Excellent for research and analysis
- Flexible and creative

**Best For:**
- Research-oriented analysis
- Creative targeting strategies
- Unrestricted content analysis

**Rate Limit:** 20 requests/minute

---

## Complete Model Hierarchy

### Analysis Tasks (Understanding & Research)
```
1. openai/gpt-oss-20b:free                    ← Primary (MoE, structured)
2. mistralai/devstral-2:free                  ← 123B, 256K context
3. deepseek/deepseek-tng-r1t2-chimera:free   ← Fast reasoning
4. cognitivecomputations/dolphin-mistral-24b:free ← Research model
5. google/gemini-2.0-flash-exp:free          ← Google latest
6. meta-llama/llama-3.3-70b-instruct:free    ← Llama 3.3
7. qwen/qwen-2.5-72b-instruct:free           ← Qwen 2.5
8. google/gemini-flash-1.5:free              ← Stable Google
```

### Creative Tasks (Generation & Recommendations)
```
1. openai/gpt-oss-20b:free                    ← Primary (structured output)
2. mistralai/devstral-2:free                  ← Agentic coding
3. deepseek/deepseek-tng-r1t2-chimera:free   ← Fast generation
4. cognitivecomputations/dolphin-mistral-24b:free ← Flexible
5. google/gemini-2.0-flash-exp:free          ← JSON expert
6. meta-llama/llama-3.3-70b-instruct:free    ← Structured output
7. qwen/qwen-2.5-72b-instruct:free           ← Instruction following
8. meta-llama/llama-3.1-8b-instruct:free     ← Fast & reliable
```

## Why These Models?

### OpenAI GPT-OSS-20B
- **Official OpenAI model** - High quality and reliability
- **MoE architecture** - Efficient use of parameters
- **Structured outputs** - Perfect for JSON generation
- **Research-grade** - Designed for analysis tasks

### Mistral Devstral 2
- **Largest free model** - 123B parameters
- **Huge context** - 256K tokens (can analyze entire websites)
- **Specialized** - Built for agentic coding and analysis
- **Latest release** - Cutting-edge capabilities

### DeepSeek Chimera
- **Speed** - Fast inference for quick results
- **Performance** - High-quality reasoning
- **Efficiency** - Good balance of speed and quality

### Dolphin Mistral 24B
- **Uncensored** - No content restrictions
- **Research-focused** - Designed for analysis
- **Flexible** - Handles diverse tasks well

## Performance Comparison

| Model | Parameters | Context | Speed | Quality | Best Use |
|-------|-----------|---------|-------|---------|----------|
| GPT-OSS-20B | 20B (MoE) | Standard | Fast | Excellent | Structured output |
| Devstral 2 | 123B | 256K | Medium | Excellent | Deep analysis |
| DeepSeek Chimera | Unknown | Standard | Very Fast | Very Good | Quick tasks |
| Dolphin 24B | 24B | Standard | Fast | Very Good | Research |
| Gemini 2.0 Flash | Unknown | Large | Fast | Excellent | JSON generation |
| Llama 3.3 70B | 70B | Large | Medium | Excellent | Reasoning |
| Qwen 2.5 72B | 72B | Large | Medium | Excellent | Analysis |

## Rate Limits

All models support **20 requests per minute** on the free tier:
- No API key cost
- No usage fees
- Suitable for production use
- Automatic rate limit handling

## Auto-Switching Logic

The system intelligently switches between models:

```typescript
// Attempt 1: Try primary model
try {
  model = 'openai/gpt-oss-20b:free'
  result = await callAI(model)
  return result // Success!
} catch (error) {
  // Rate limited or error
}

// Attempt 2: Try best fallback
try {
  model = 'mistralai/devstral-2:free'
  result = await callAI(model)
  return result // Success!
} catch (error) {
  // All AI failed, use real data
}

// Fallback: Use real website data
return generateFromRealData()
```

## Expected Behavior

### Normal Operation (90% of requests)
```
Request 1: openai/gpt-oss-20b:free ✅ Success
Request 2: openai/gpt-oss-20b:free ✅ Success
Request 3: openai/gpt-oss-20b:free ✅ Success
...
Request 20: openai/gpt-oss-20b:free ✅ Success
Request 21: openai/gpt-oss-20b:free ❌ Rate limit
Request 21: mistralai/devstral-2:free ✅ Success (auto-switched!)
```

### High Load (multiple users)
```
User A Request: openai/gpt-oss-20b:free ✅
User B Request: openai/gpt-oss-20b:free ✅
User C Request: openai/gpt-oss-20b:free ❌ Rate limit
User C Request: mistralai/devstral-2:free ✅ (switched)
User D Request: openai/gpt-oss-20b:free ✅ (rate limit reset)
```

## Benefits of Upgrade

### Before (Old Models)
- Primary: Google Gemini 2.0 Flash
- 4 fallback models
- Some models less reliable
- Smaller parameter counts

### After (New Models)
- Primary: OpenAI GPT-OSS-20B (official OpenAI!)
- 8 fallback models
- All high-performance models
- Up to 123B parameters (Devstral 2)
- 256K context window (Devstral 2)
- Better structured output
- Faster reasoning
- More reliable

## Testing the Upgrade

### Check which model is being used:
```bash
# Watch the logs
tail -f backend/logs/combined.log | grep "OpenRouter API call successful"

# You should see:
# ✅ OpenRouter API call successful. Model: openai/gpt-oss-20b:free
# or
# ✅ OpenRouter API call successful. Model: mistralai/devstral-2:free
```

### Test model switching:
```bash
# Make rapid requests to trigger rate limits
for i in {1..25}; do
  curl -X POST http://localhost:3000/api/analysis \
    -H "Content-Type: application/json" \
    -d '{"website_url": "https://stripe.com"}' &
done

# Watch logs for model switching:
# ✅ Model: openai/gpt-oss-20b:free (requests 1-20)
# ⚠️ Rate limit hit, switching...
# ✅ Model: mistralai/devstral-2:free (requests 21-40)
```

## Model Selection Strategy

The system uses a **smart model selection** strategy:

1. **Task-based selection**: Different models for analysis vs generation
2. **Failure tracking**: Remembers which models failed recently
3. **Automatic rotation**: Switches to next best model on failure
4. **Rate limit awareness**: Detects 429 errors and switches immediately
5. **Success reset**: Resets failure count on successful calls

## Summary

The upgraded model pool provides:
- ✅ **Better quality** - OpenAI and Mistral's best free models
- ✅ **More reliability** - 8 fallback options vs 4
- ✅ **Larger capacity** - Up to 123B parameters
- ✅ **Bigger context** - 256K tokens for deep analysis
- ✅ **Faster switching** - Automatic model rotation
- ✅ **Same cost** - Still 100% free!

**Result:** Higher success rate, better quality recommendations, and more reliable service for all users.
