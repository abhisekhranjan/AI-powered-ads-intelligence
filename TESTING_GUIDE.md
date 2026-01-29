# Testing Guide - RiseRoutes AI Ads Intelligence Platform

## ✅ All Features Are Working!

Your platform is fully functional with:
- ✅ OpenRouter API configured with free Gemini 2.0 Flash model
- ✅ Real AI analysis (with rate limit fallback to templates)
- ✅ Premium dashboard with all 5 tabs
- ✅ Color-coded recommendations (scale/test/avoid)
- ✅ Funnel stages (TOF/MOF/BOF)
- ✅ Expandable cards with reasoning
- ✅ Export to CSV functionality

## 🧪 How to Test All Features

### Step 1: Open the App
```
http://localhost:5173
```

### Step 2: Analyze a Website
1. Click "Analyze My Website" or go to http://localhost:5173/analyze
2. Enter a website URL (e.g., `https://stripe.com`)
3. Select target location
4. (Optional) Add competitor URLs
5. Click "Analyze Ads Targeting"

### Step 3: Wait for Analysis
- You'll see animated "thinking" messages
- Takes 30-60 seconds
- Automatically redirects to dashboard when complete

### Step 4: Explore the Dashboard

#### **Overview Tab** 
- Ideal Customer card
- Buying Intent progress bar
- Funnel Stage badges (TOF/MOF/BOF)
- Platform Fit recommendation
- Key Insights (what's wrong vs what to do)

#### **Meta Ads Tab**
- Interest Targeting cards with:
  - 🔥 Green = Scale (high confidence)
  - 🧪 Yellow = Test (medium confidence)
  - ❌ Red = Avoid (low confidence)
  - Funnel stage badges
  - Click to expand for full reasoning
  - Copy button for each card
- Behavior Targeting cards (same features)
- Export CSV button

#### **Google Ads Tab**
- Sub-tabs: Search | Performance Max | Display/YouTube
- Keyword clusters with:
  - Intent level badges (High/Medium/Low)
  - Funnel stages
  - Match types
  - Negative keywords in red
  - Click to expand for reasoning
- Export CSV button

#### **Competitor Intelligence Tab**
- Competitor cards showing:
  - Their audience interests (purple tags)
  - Their keywords (pink tags)
  - Opportunity gaps
- Empty state if no competitors analyzed

#### **Fix My Ads Tab**
- ❌ What You're Likely Doing Wrong (3 common mistakes)
- ✅ What You Should Do Instead (with real examples from your analysis)
- Priority Actions with estimated ROAS impact

### Step 5: Test Export
1. Go to Meta Ads or Google Ads tab
2. Click "Export CSV" button
3. Check downloaded file has all targeting data

## 🔍 Latest Test Results

**Session ID:** `88819338-fdc6-45a8-ae8e-be13e1bfe6b7`
**Dashboard URL:** http://localhost:5173/dashboard/88819338-fdc6-45a8-ae8e-be13e1bfe6b7

**Data Verified:**
- ✅ Meta Ads: 6 interest targeting recommendations
- ✅ Meta Ads: 3 behavior targeting recommendations  
- ✅ Google Ads: 2 keyword clusters
- ✅ All with funnel stages (TOF/MOF/BOF)
- ✅ All with recommendations (scale/test/avoid)
- ✅ All with reasoning and confidence scores

## 🤖 AI Status

**Current Model:** `google/gemini-2.0-flash-exp:free`

**How It Works:**
1. First analysis call succeeds (audience insights)
2. Subsequent calls may hit rate limits (429 error)
3. System automatically falls back to smart templates
4. Templates use business model + content themes for targeting

**Rate Limits:**
- Free Gemini model has strict rate limits
- ~1-2 requests per minute
- Wait 60 seconds between analyses for full AI
- Or use templates (still very good quality!)

## 💡 Tips for Best Results

1. **Wait Between Analyses:** Free model has rate limits
2. **Use Descriptive URLs:** Better analysis with clear business models
3. **Add Competitors:** Get competitive intelligence insights
4. **Expand Cards:** Click any card to see full AI reasoning
5. **Export Data:** Use CSV exports to import into Meta/Google Ads Manager

## 🐛 Troubleshooting

### "No data showing in dashboard"
- Wait 30-60 seconds for analysis to complete
- Check session status is "completed"
- Refresh the page
- Check browser console for errors

### "Failed to connect to server"
- Ensure backend is running: `cd backend && npm run dev`
- Check http://localhost:3000/api is accessible
- Verify OpenRouter API key is set in `backend/.env`

### "Analysis taking too long"
- Normal for first analysis (cold start)
- Subsequent analyses are faster (cached)
- Rate limits may slow down AI calls

### "Empty targeting recommendations"
- This was fixed! Old sessions may have empty data
- Run a new analysis to see full data
- Use the test script: `./test-analysis.sh`

## 📊 Database Check

To verify data is being stored:
```bash
mysql -u root riseroutes_dev -e "
SELECT 
  s.id,
  s.status,
  s.website_url,
  COUNT(DISTINCT tr.id) as targeting_count
FROM analysis_sessions s
LEFT JOIN targeting_recommendations tr ON s.id = tr.session_id
GROUP BY s.id
ORDER BY s.created_at DESC
LIMIT 5;
"
```

## 🎉 Success Criteria

Your platform is working if you can:
- ✅ Analyze a website URL
- ✅ See 5 tabs in dashboard
- ✅ See color-coded cards (green/yellow/red)
- ✅ See funnel stage badges (TOF/MOF/BOF)
- ✅ Expand cards to see reasoning
- ✅ Export to CSV
- ✅ See "Fix My Ads" diagnostic recommendations

**All features are confirmed working!** 🚀
