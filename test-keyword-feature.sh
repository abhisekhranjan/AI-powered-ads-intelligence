#!/bin/bash

# Test script for keyword-enhanced targeting feature

echo "🧪 Testing Keyword-Enhanced Targeting Feature"
echo "=============================================="
echo ""

# Test 1: Analysis with keywords
echo "📝 Test 1: Creating analysis session with keywords..."
curl -X POST http://localhost:3000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://example.com",
    "target_location": "United States",
    "keywords": ["plumbing services", "emergency repairs", "water heaters"],
    "competitor_urls": []
  }' \
  -s | jq '.'

echo ""
echo "✅ Test 1 Complete"
echo ""

# Test 2: Analysis without keywords (backward compatibility)
echo "📝 Test 2: Creating analysis session WITHOUT keywords..."
curl -X POST http://localhost:3000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "website_url": "https://example.com",
    "target_location": "United States",
    "competitor_urls": []
  }' \
  -s | jq '.'

echo ""
echo "✅ Test 2 Complete"
echo ""

echo "🎉 All tests completed!"
echo ""
echo "Next steps:"
echo "1. Check the session IDs returned above"
echo "2. Wait for analysis to complete (~30-60 seconds)"
echo "3. Fetch results: curl http://localhost:3000/api/analysis/session/{SESSION_ID} | jq '.'"
echo "4. Compare keyword-focused vs standard recommendations"
