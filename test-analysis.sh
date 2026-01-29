#!/bin/bash

echo "🧪 Testing RiseRoutes AI Ads Intelligence Platform"
echo "=================================================="
echo ""

# Test website analysis
echo "📊 Step 1: Analyzing website..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://stripe.com",
    "target_location": "United States",
    "competitor_urls": []
  }')

SESSION_ID=$(echo $RESPONSE | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "❌ Failed to create analysis session"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Analysis session created: $SESSION_ID"
echo ""

# Wait for analysis to complete
echo "⏳ Waiting for analysis to complete (30 seconds)..."
sleep 30
echo ""

# Fetch session data
echo "📥 Step 2: Fetching analysis results..."
SESSION_DATA=$(curl -s http://localhost:3000/api/analysis/session/$SESSION_ID)

echo "✅ Session data retrieved"
echo ""

# Check Meta Ads targeting
echo "🎯 Step 3: Checking Meta Ads targeting..."
META_INTERESTS=$(echo $SESSION_DATA | grep -o '"interests":\[' | wc -l)
if [ $META_INTERESTS -gt 0 ]; then
  echo "✅ Meta Ads interests found"
else
  echo "❌ No Meta Ads interests found"
fi

META_BEHAVIORS=$(echo $SESSION_DATA | grep -o '"behaviors":\[' | wc -l)
if [ $META_BEHAVIORS -gt 0 ]; then
  echo "✅ Meta Ads behaviors found"
else
  echo "❌ No Meta Ads behaviors found"
fi
echo ""

# Check Google Ads targeting
echo "🔍 Step 4: Checking Google Ads targeting..."
GOOGLE_KEYWORDS=$(echo $SESSION_DATA | grep -o '"keywords":\[' | wc -l)
if [ $GOOGLE_KEYWORDS -gt 0 ]; then
  echo "✅ Google Ads keywords found"
else
  echo "❌ No Google Ads keywords found"
fi
echo ""

# Display summary
echo "📋 Summary:"
echo "==========="
echo "Session ID: $SESSION_ID"
echo "Dashboard URL: http://localhost:5173/dashboard/$SESSION_ID"
echo ""
echo "🎉 Test complete! Open the dashboard URL to see all features."
