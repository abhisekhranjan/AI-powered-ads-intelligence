#!/bin/bash

echo "🧪 Testing AI Integration via API"
echo ""
echo "Testing with openrouter/auto model"
echo "=================================="
echo ""

# Test the analysis endpoint
echo "📊 Sending test request to /api/analysis/analyze..."
echo ""

curl -X POST http://localhost:3000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.shopify.com",
    "keywords": ["ecommerce", "online store"]
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' || echo "Response received (jq not available for formatting)"

echo ""
echo "✅ Test complete!"
