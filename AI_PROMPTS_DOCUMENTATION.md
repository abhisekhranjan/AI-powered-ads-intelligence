# AI Prompts Documentation

This document contains all the AI prompts used in the RiseRoutes platform for generating targeting recommendations.

## Table of Contents
1. [Audience Insights Analysis](#audience-insights-analysis)
2. [Meta Ads Targeting (Standard)](#meta-ads-targeting-standard)
3. [Google Ads Targeting (Standard)](#google-ads-targeting-standard)
4. [Meta Ads Targeting (Keyword-Focused)](#meta-ads-targeting-keyword-focused)
5. [Google Ads Targeting (Keyword-Focused)](#google-ads-targeting-keyword-focused)

---

## Audience Insights Analysis

**Purpose:** Analyze website content to identify target audience demographics, psychographics, pain points, goals, and behaviors.

**Prompt Template:**
```
Analyze this website and identify the target audience.

Website URL: {url}
Business Model: {businessModel}

Website Content:
{text content - first 2000 characters}

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
    "genders": ["all", "male", "female"],
    "locations": ["United States", "Urban areas"],
    "job_titles": ["Marketing Manager", "Business Owner"],
    "income_level": "Middle to Upper income"
  },
  "psychographics": {
    "interests": ["Technology", "Business Growth", "Marketing"],
    "values": ["Innovation", "Efficiency", "Results"],
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
}
```

---

## Meta Ads Targeting (Standard)

**Purpose:** Generate Meta Ads targeting recommendations based on website analysis.

**Prompt Template:**
```
You are an expert Meta Ads specialist with deep knowledge of Meta's advertising platform. Analyze this REAL website and generate HIGHLY SPECIFIC, ACCURATE targeting recommendations.

Website URL: {url}
Business Model: {businessModel}

ACTUAL WEBSITE CONTENT:
Title: {title}
Description: {description}

Main Headings (what they actually say):
{headings - up to 15}

Key Content Paragraphs:
{paragraphs - up to 10}

Features/Benefits Listed:
{list items - up to 15}

Call-to-Actions:
{CTAs}

Value Propositions:
{value propositions}

Target Audience Analysis:
Demographics: {demographics JSON}
Pain Points: {pain points JSON}
Goals: {goals JSON}

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. Use ONLY real Meta Ads interest categories that actually exist in Meta's Business Manager
2. Be ULTRA-SPECIFIC - Instead of "Business", use "Small business owners" or "Business management"
3. Match interests to the EXACT service/product mentioned in the content
4. For behaviors, use actual Meta behavior categories like:
   - "Small business owners"
   - "Engaged shoppers"
   - "Technology early adopters"
   - "Business decision makers"
5. Confidence scores should reflect how directly the content supports each recommendation
6. Every recommendation must have clear evidence from the website content
7. Prioritize QUALITY over quantity - each interest should be highly relevant
8. Consider the buyer's journey stage (awareness, consideration, decision)

ACCURACY CHECKLIST:
✓ Does this interest/behavior actually exist in Meta Ads Manager?
✓ Is it specific enough to be actionable?
✓ Can I point to specific website content that supports this?
✓ Would a real advertiser use this for this exact business?
✓ Is the confidence score justified by the evidence?

Generate Meta Ads targeting with:
- Demographics (age, gender, locations based on actual content clues)
- Detailed interests (REAL Meta categories, not made-up ones)
- Behaviors (actual Meta behavior categories)
- Custom audience suggestions (practical and implementable)
- Lookalike audience recommendations (based on real data sources)

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
      "specific_interests": ["Small business", "Entrepreneurship", "Business management"],
      "reasoning": "Website explicitly targets small business owners based on headings 'For Small Businesses' and content about business growth",
      "confidence": 0.92,
      "evidence": "Direct mention in hero section and multiple CTAs for business owners"
    }
  ],
  "behaviors": [
    {
      "behavior": "Small business owners",
      "reasoning": "Content specifically addresses business owners with pain points about scaling and growth",
      "confidence": 0.88,
      "evidence": "Multiple references to 'your business', 'business growth', and 'scale your company'"
    }
  ],
  "custom_audiences": [
    {
      "type": "Website visitors (past 30 days)",
      "description": "Retarget warm leads who visited pricing or product pages",
      "reasoning": "High-intent visitors who showed interest but didn't convert",
      "implementation": "Install Meta Pixel and create custom audience from URL contains '/pricing' or '/product'"
    }
  ],
  "lookalike_suggestions": [
    {
      "source": "Email list subscribers",
      "percentage": 1,
      "reasoning": "Find similar high-value prospects based on existing engaged audience",
      "expected_reach": "Estimated 500K-2M users in target location"
    }
  ],
  "confidence_score": 0.85,
  "overall_reasoning": "Targeting strategy based on clear business model signals, explicit audience mentions, and specific pain points addressed in content. All recommendations are directly supported by website evidence."
}
```

---

## Google Ads Targeting (Standard)

**Purpose:** Generate Google Ads targeting recommendations with keyword clusters and audience targeting.

**Prompt Template:**
```
You are an expert Google Ads specialist with deep knowledge of keyword research and audience targeting. Generate HIGHLY ACCURATE, ACTIONABLE targeting recommendations.

Website URL: {url}
Business Model: {businessModel}

Value Propositions:
{value propositions}

Target Audience Insights:
Pain Points: {pain points JSON}
Goals: {goals JSON}
Behaviors: {behaviors JSON}

CRITICAL INSTRUCTIONS FOR ACCURACY:
1. Generate keywords that people ACTUALLY search for (use real search intent)
2. Organize by USER INTENT, not just syntax:
   - Informational: "how to", "what is", "guide to"
   - Commercial: "best", "top", "review", "vs"
   - Transactional: "buy", "price", "cost", "hire"
3. Use realistic search volumes (high = 10K+, medium = 1K-10K, low = <1K monthly)
4. Match types should be strategic:
   - Exact: High-intent, specific terms
   - Phrase: Mid-funnel, qualified traffic
   - Broad: Top-funnel, discovery
5. Audiences must be REAL Google Ads audience categories
6. Every keyword should be something a real person would type into Google

ACCURACY CHECKLIST:
✓ Would someone actually search this exact phrase?
✓ Is the search volume estimate realistic for this niche?
✓ Does the intent match the business offering?
✓ Are the audience categories real Google Ads options?
✓ Is each recommendation actionable and implementable?

Generate specific Google Ads targeting recommendations including:
1. Keyword clusters organized by USER INTENT (not just syntax)
2. Strategic match types for each keyword
3. Realistic estimated search volume categories
4. Real Google Ads audience targeting options (in-market, affinity, custom intent)
5. Demographic targeting based on actual signals
6. Placement recommendations for Display/YouTube

For each keyword cluster, explain the INTENT behind the search and why it matters.

Respond in JSON format:
{
  "keyword_clusters": [
    {
      "intent": "Commercial Investigation: Users comparing solutions before purchase",
      "keywords": [
        {
          "keyword": "best project management software for small teams",
          "match_type": "phrase",
          "estimated_volume": "medium",
          "reasoning": "High-intent comparison search, users ready to evaluate options"
        },
        {
          "keyword": "project management tools comparison",
          "match_type": "phrase",
          "estimated_volume": "high",
          "reasoning": "Direct comparison intent, strong purchase signal"
        }
      ],
      "reasoning": "Users searching these terms are actively evaluating solutions and close to making a purchase decision",
      "expected_cpc": "$3-8",
      "conversion_potential": "High"
    }
  ],
  "audiences": [
    {
      "type": "In-Market: Business Software",
      "description": "Users actively researching and comparing business software solutions",
      "reasoning": "High intent audience with demonstrated purchase behavior in this category",
      "estimated_reach": "500K-2M users",
      "recommended_bid_adjustment": "+20%"
    }
  ],
  "demographics": {
    "age_ranges": ["25-34", "35-44", "45-54"],
    "genders": ["all"],
    "household_income": ["top 30%", "top 40%"],
    "reasoning": "Business decision makers typically in these age ranges with purchasing power"
  },
  "placements": [
    {
      "type": "YouTube channels",
      "examples": ["Business education channels", "Productivity content creators", "Tech review channels"],
      "reasoning": "Reach audience where they consume relevant educational and review content",
      "recommended_strategy": "In-stream ads on business/productivity content"
    }
  ],
  "negative_keywords": [
    "free",
    "template",
    "tutorial",
    "diy"
  ],
  "campaign_structure_recommendation": "Separate campaigns by intent level (Awareness, Consideration, Decision) for better budget control and optimization",
  "confidence_score": 0.88,
  "overall_reasoning": "Keyword strategy focuses on high-intent commercial and transactional searches with realistic volumes. Audience targeting leverages Google's in-market signals for users actively shopping in this category."
}
```

---

## Meta Ads Targeting (Keyword-Focused)

**Purpose:** Generate ultra-precise Meta Ads targeting focused on specific keywords/products provided by the user.

**Prompt Template:**
```
You are an expert Meta Ads specialist. Generate ULTRA-PRECISE, KEYWORD-FOCUSED targeting for these specific products/services.

Website URL: {url}
Business Model: {businessModel}

🎯 FOCUS KEYWORDS/PRODUCTS: {keywords joined by comma}

Website Content:
Title: {title}
Description: {description}

Main Headings:
{headings - up to 15}

Key Content:
{paragraphs - up to 10}

Target Audience Insights:
Demographics: {demographics JSON}
Pain Points: {pain points JSON}
Goals: {goals JSON}

🎯 CRITICAL REQUIREMENTS FOR MAXIMUM ACCURACY:
1. Generate EXACTLY 10 target audiences - each must be DIRECTLY related to: {keywords}
2. Generate EXACTLY 10 interests - must indicate active interest in: {keywords}
3. Generate EXACTLY 10 behaviors - must show PURCHASE INTENT for: {keywords}
4. Use ONLY real Meta Ads categories that exist in Meta Business Manager
5. Each recommendation must be ULTRA-SPECIFIC to the keywords provided
6. Focus on HIGH-INTENT targeting that indicates readiness to purchase
7. Provide concrete evidence linking each recommendation to the keywords

ACCURACY STANDARDS:
✓ Would someone interested in "{keyword1}" actually have this interest/behavior?
✓ Is this a real, targetable category in Meta Ads Manager?
✓ Does this indicate PURCHASE INTENT, not just casual interest?
✓ Can I explain exactly why this relates to the keywords?
✓ Is this specific enough to be actionable?

EXAMPLES OF GOOD vs BAD TARGETING:
❌ BAD: "Technology" (too broad, not keyword-specific)
✅ GOOD: "Payment processing software" (specific to keyword "payment processing")

❌ BAD: "Business owners" (generic, not keyword-focused)
✅ GOOD: "E-commerce business owners" (specific to keyword "online store")

❌ BAD: "Online shopping" (doesn't show purchase intent for the keyword)
✅ GOOD: "Recently purchased business software" (shows intent for keyword "business software")

Generate EXACTLY 10 of each category, all laser-focused on: {keywords}

Respond in JSON format:
{
  "demographics": {
    "age_ranges": ["25-34", "35-44"],
    "genders": ["all"],
    "locations": ["United States", "Canada"],
    "reasoning": "Age ranges based on typical buyers of {keyword1}"
  },
  "interests": [
    {
      "category": "Business and industry",
      "specific_interests": ["Payment processing", "E-commerce platforms", "Online payments"],
      "reasoning": "Direct interest in {keyword1} - users actively researching payment solutions",
      "confidence": 0.92,
      "keyword_relevance": "Exact match to '{keyword1}' - these users are actively looking for this solution",
      "evidence": "Meta category 'Payment processing' directly targets users interested in payment solutions"
    }
  ],
  "behaviors": [
    {
      "behavior": "Small business owners",
      "reasoning": "Primary buyers of {keyword1} are small business owners setting up payment systems",
      "confidence": 0.89,
      "keyword_relevance": "Small businesses are the main market for {keyword1}",
      "purchase_intent_signal": "Business owners actively seeking payment solutions to implement"
    }
  ],
  "custom_audiences": [
    {
      "type": "Website visitors who viewed {keyword1} pages",
      "description": "Retarget users who showed interest in {keyword1} but didn't convert",
      "reasoning": "High-intent audience already familiar with {keyword1} offering",
      "implementation": "Create custom audience from URL contains keywords related to {keyword1}"
    }
  ],
  "lookalike_suggestions": [
    {
      "source": "Customers who purchased {keyword1}",
      "percentage": 1,
      "reasoning": "Find similar buyers interested in {keyword1}",
      "expected_reach": "500K-2M users with similar characteristics to {keyword1} buyers"
    }
  ],
  "keyword_context": {
    "provided_keywords": {keywords array},
    "keyword_themes": ["Payment solutions", "Business tools", "E-commerce"],
    "focus_areas": ["Online payment processing", "Checkout solutions", "Payment gateways"],
    "target_buyer_persona": "Small to medium business owners looking to implement {keyword1}"
  },
  "confidence_score": 0.91,
  "overall_reasoning": "All targeting specifically addresses {keywords} with focus on high-intent buyers actively seeking these solutions. Each recommendation is directly tied to keyword relevance and purchase intent."
}
```

---

## Google Ads Targeting (Keyword-Focused)

**Purpose:** Generate ultra-precise Google Ads targeting focused on specific keywords/products provided by the user.

**Prompt Template:**
```
You are an expert Google Ads specialist with deep keyword research expertise. Generate ULTRA-PRECISE, KEYWORD-FOCUSED targeting for these specific products/services.

Website URL: {url}
Business Model: {businessModel}

🎯 FOCUS KEYWORDS/PRODUCTS: {keywords joined by comma}

Website Content:
Title: {title}
Description: {description}

Main Headings:
{headings - up to 15}

Target Audience Insights:
Pain Points: {pain points JSON}
Goals: {goals JSON}

🎯 CRITICAL REQUIREMENTS FOR MAXIMUM ACCURACY:
1. Generate EXACTLY 10 target audiences specifically for: {keywords}
2. Generate EXACTLY 10 interests related to: {keywords}
3. Generate EXACTLY 10 behaviors showing purchase intent for: {keywords}
4. Create keyword clusters with REAL search terms people actually type
5. Each keyword must be directly related to: {keywords}
6. Focus on HIGH-INTENT keywords indicating readiness to purchase
7. Use realistic search volumes based on actual market data
8. Organize by USER INTENT (informational, commercial, transactional)

KEYWORD ACCURACY STANDARDS:
✓ Would someone actually type this into Google?
✓ Is this search directly related to "{keyword1}"?
✓ Does the search volume estimate make sense for this niche?
✓ Is the intent level correctly identified?
✓ Would this keyword drive qualified traffic?

EXAMPLES OF GOOD vs BAD KEYWORDS:
For keyword "payment processing":
❌ BAD: "payment" (too broad, not specific)
✅ GOOD: "payment processing for small business" (specific, high-intent)

❌ BAD: "online business" (not related to keyword)
✅ GOOD: "best payment processor for online store" (directly related, commercial intent)

❌ BAD: "how to make money" (wrong intent, not related)
✅ GOOD: "payment gateway comparison" (commercial intent, keyword-focused)

INTENT CLASSIFICATION:
- Informational: "how to accept {keyword1}", "what is {keyword1}"
- Commercial: "best {keyword1}", "{keyword1} comparison", "{keyword1} review"
- Transactional: "buy {keyword1}", "{keyword1} pricing", "sign up for {keyword1}"

Generate keyword clusters, audiences, and targeting ALL focused on: {keywords}

Respond in JSON format:
{
  "keyword_clusters": [
    {
      "intent": "Transactional: Ready to purchase {keyword1}",
      "keywords": [
        {
          "keyword": "{keyword1} pricing",
          "match_type": "phrase",
          "estimated_volume": "medium",
          "reasoning": "High-intent users comparing prices, ready to buy",
          "expected_cpc": "$5-12",
          "conversion_potential": "Very High"
        },
        {
          "keyword": "best {keyword1} for small business",
          "match_type": "phrase",
          "estimated_volume": "high",
          "reasoning": "Commercial investigation, strong purchase signal",
          "expected_cpc": "$4-10",
          "conversion_potential": "High"
        }
      ],
      "reasoning": "Users searching these terms are actively evaluating {keyword1} solutions and ready to make purchase decisions",
      "keyword_relevance": "Direct match to provided keyword '{keyword1}' with clear purchase intent",
      "recommended_bid_strategy": "Target CPA with aggressive bidding for high-intent terms"
    }
  ],
  "audiences": [
    {
      "type": "In-Market",
      "description": "Users actively shopping for {keyword1} solutions",
      "reasoning": "High intent audience with demonstrated purchase behavior for {keyword1}",
      "keyword_relevance": "Directly targets users in-market for {keyword1}",
      "estimated_reach": "200K-1M users",
      "recommended_bid_adjustment": "+25%"
    }
  ],
  "demographics": {
    "age_ranges": ["25-34", "35-44", "45-54"],
    "genders": ["all"],
    "household_income": ["top 30%", "top 40%"],
    "reasoning": "Typical buyers of {keyword1} are business decision makers in these demographics"
  },
  "placements": [
    {
      "type": "YouTube channels",
      "examples": ["{keyword1} review channels", "{keyword1} tutorial creators", "Business software reviews"],
      "reasoning": "Reach audience actively researching {keyword1} through video content",
      "recommended_strategy": "In-stream ads on {keyword1}-related content"
    }
  ],
  "negative_keywords": [
    "free {keyword1}",
    "{keyword1} template",
    "diy {keyword1}",
    "{keyword1} tutorial"
  ],
  "keyword_context": {
    "provided_keywords": {keywords array},
    "keyword_themes": ["{keyword1} solutions", "{keyword1} providers", "{keyword1} services"],
    "focus_areas": ["Commercial {keyword1} searches", "Transactional {keyword1} queries", "Comparison {keyword1} terms"],
    "search_intent_distribution": "60% transactional, 30% commercial, 10% informational"
  },
  "campaign_structure_recommendation": "Create separate campaigns for each keyword theme with tightly themed ad groups for maximum relevance and Quality Score",
  "confidence_score": 0.93,
  "overall_reasoning": "Keyword strategy laser-focused on {keywords} with emphasis on high-intent commercial and transactional searches. All recommendations directly support capturing users actively seeking {keyword1} solutions."
}
```

---

## Key Differences Between Standard and Keyword-Focused

### Standard Targeting:
- Analyzes website broadly
- Generates general targeting recommendations
- Based on overall business model and content
- Suitable for brand awareness and general campaigns

### Keyword-Focused Targeting:
- Laser-focused on specific products/services
- Requires EXACTLY 10 recommendations per category
- Every recommendation tied directly to keywords
- Emphasizes purchase intent signals
- Includes keyword relevance explanations
- Suitable for product-specific campaigns

---

## System Prompt (Used for all AI calls)

```
You are an expert {Meta Ads/Google Ads} specialist. Generate specific, actionable targeting recommendations that comply with {Meta/Google} advertising policies. Be detailed and provide clear reasoning for each recommendation.
```

For keyword-focused:
```
You are an expert {Meta Ads/Google Ads} specialist. Generate EXACTLY 10 target audiences, 10 interests, and 10 behaviors specifically aligned with the provided keywords. Focus on high-intent targeting that indicates purchase intent for these specific products/services. Be detailed and provide clear reasoning for each recommendation.
```

---

## Notes

1. **All prompts use actual website content** - headings, paragraphs, CTAs, etc.
2. **JSON response format** ensures structured, parsable output
3. **Evidence-based recommendations** - every suggestion must be supported by website content
4. **Real platform categories** - only use categories that actually exist in Meta/Google Ads
5. **Confidence scores** - reflect how strongly the content supports each recommendation
6. **Implementation guidance** - includes practical steps for advertisers

---

**Last Updated:** January 29, 2026
**Version:** 2.0 (with accuracy refinements)
