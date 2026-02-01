#!/usr/bin/env tsx
/**
 * Simple DeepSeek API Test
 * Direct test of DeepSeek API integration
 */

import OpenAI from 'openai'

const DEEPSEEK_API_KEY = 'sk-17cd3e167a014900a727d6e6e21a39bb'
const MODEL = 'deepseek-chat'

console.log('🧪 Testing DeepSeek API Integration\n')
console.log(`🔧 Model: ${MODEL}`)
console.log(`🔑 API Key: ${DEEPSEEK_API_KEY.substring(0, 20)}...\n`)

const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
})

async function testBusinessAnalysis() {
  console.log('📊 Test 1: Business Model Analysis\n')
  
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
    console.log('⏳ Calling DeepSeek API...\n')
    
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
    console.log('⏳ Calling DeepSeek API...\n')
    
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

async function testReasonerModel() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 Test 3: DeepSeek Reasoner Model\n')
  
  try {
    console.log('⏳ Calling DeepSeek API with deepseek-reasoner...\n')
    
    const response = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        { role: 'user', content: 'Explain why SaaS businesses are popular. Keep it brief.' }
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
    console.log('\n❌ Test 2 failed. Stopping.')
    process.exit(1)
  }
  
  const test3 = await testReasonerModel()
  
  if (!test3) {
    console.log('\n⚠️ Test 3 failed (deepseek-reasoner may not be available).')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n🎉 DeepSeek API integration tests completed!\n')
}

runTests().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
