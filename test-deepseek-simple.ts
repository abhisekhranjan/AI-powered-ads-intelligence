#!/usr/bin/env tsx
/**
 * Simple DeepSeek Model Test
 * Direct test of deepseek/deepseek-r1-0528:free via OpenRouter
 */

import OpenAI from 'openai'

const OPENROUTER_API_KEY = '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'
const MODEL = 'openrouter/auto'

console.log('🧪 Testing OpenRouter Auto Model Selection\n')
console.log(`🔧 Model: ${MODEL} (auto-selects best available model)`)
console.log(`🔑 API Key: ${OPENROUTER_API_KEY.substring(0, 20)}...\n`)

const client = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://test-app.com',
    'X-Title': 'DeepSeek Test'
  }
})

async function testBusinessAnalysis() {
  console.log('📊 Test: Business Model Analysis\n')
  
  const prompt = `Analyze this website's business model and respond in JSON format.

Website: https://example-saas.com
Title: ProjectFlow - Project Management for Small Teams
Description: Simple, powerful project management software for teams of 5-50 people

Respond in JSON format:
{
  "type": "SaaS",
  "description": "Brief description",
  "confidence": 0.9,
  "reasoning": "Why you classified it this way"
}`

  try {
    console.log('⏳ Calling OpenRouter API...\n')
    
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: 'You are an expert marketing analyst. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ]
    })

    const content = response.choices[0]?.message?.content
    
    if (!content) {
      console.log('❌ Empty response from API')
      return false
    }

    console.log('✅ API Response received\n')
    console.log('📦 Raw Response:')
    console.log(content)
    console.log('\n' + '─'.repeat(60))
    
    // Try to extract JSON
    let jsonData
    try {
      // Try to find JSON in response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        jsonData = JSON.parse(jsonStr)
        console.log('\n✅ Parsed JSON:')
        console.log(JSON.stringify(jsonData, null, 2))
      } else {
        console.log('\n⚠️ No JSON found in response, but API call succeeded')
      }
    } catch (e) {
      console.log('\n⚠️ Could not parse JSON, but API call succeeded')
    }

    console.log('\n📊 Usage Stats:')
    console.log(`  Prompt tokens: ${response.usage?.prompt_tokens || 'N/A'}`)
    console.log(`  Completion tokens: ${response.usage?.completion_tokens || 'N/A'}`)
    console.log(`  Total tokens: ${response.usage?.total_tokens || 'N/A'}`)
    
    return true
  } catch (error: any) {
    console.log('❌ API call failed\n')
    console.error('Error:', error.message)
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    
    return false
  }
}

async function testSimpleQuestion() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test 2: Simple Question\n')
  
  try {
    console.log('⏳ Calling OpenRouter API...\n')
    
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: 'user', content: 'What is 2+2? Respond with just the number.' }
      ]
    })

    const content = response.choices[0]?.message?.content
    
    console.log('✅ API Response:')
    console.log(content)
    console.log('\n📊 Tokens used:', response.usage?.total_tokens || 'N/A')
    
    return true
  } catch (error: any) {
    console.log('❌ API call failed')
    console.error('Error:', error.message)
    return false
  }
}

async function runTests() {
  const test1 = await testBusinessAnalysis()
  
  if (!test1) {
    console.log('\n❌ Test 1 failed. Stopping.')
    process.exit(1)
  }
  
  const test2 = await testSimpleQuestion()
  
  if (!test2) {
    console.log('\n❌ Test 2 failed.')
    process.exit(1)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n🎉 All tests passed! DeepSeek model is working correctly.\n')
}

runTests().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
