#!/usr/bin/env tsx
/**
 * DeepSeek Model Test Script
 * Tests the deepseek/deepseek-r1-0528:free model via OpenRouter
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from backend/.env
dotenv.config({ path: resolve(process.cwd(), 'backend/.env') })

import { aiReasoningEngine } from './backend/src/services/aiReasoningEngine.js'
import { config } from './backend/src/config/env.js'

console.log('🧪 Testing DeepSeek Model via OpenRouter\n')

// Check if API key is configured
if (!config.openai.apiKey) {
  console.error('❌ Error: OPENAI_API_KEY not set in backend/.env')
  console.error('Please add your OpenRouter API key to backend/.env')
  process.exit(1)
}

console.log('✅ API Key configured')
console.log('🔧 Model: deepseek/deepseek-r1-0528:free\n')

// Test data - simple website content
const testWebsiteContent = {
  url: 'https://example-saas.com',
  title: 'ProjectFlow - Project Management for Small Teams',
  description: 'Simple, powerful project management software for teams of 5-50 people',
  headings: [
    'Manage Projects Effortlessly',
    'Built for Small Teams',
    'Features',
    'Task Management',
    'Team Collaboration',
    'Time Tracking',
    'Pricing'
  ],
  paragraphs: [
    'ProjectFlow helps small teams stay organized and productive.',
    'Track tasks, collaborate with your team, and hit your deadlines.',
    'Perfect for startups, agencies, and growing businesses.'
  ],
  listItems: [
    'Unlimited projects',
    'Team collaboration tools',
    'Time tracking',
    'File sharing',
    'Mobile apps'
  ],
  ctas: ['Start Free Trial', 'See Pricing', 'Book a Demo'],
  text: 'ProjectFlow - Project Management for Small Teams. Simple, powerful project management software for teams of 5-50 people. Manage Projects Effortlessly. Built for Small Teams.'
}

async function runTests() {
  console.log('📊 Test 1: Business Model Analysis\n')
  
  try {
    const result = await aiReasoningEngine.analyzeBusinessModel(testWebsiteContent)
    
    if (result.success) {
      console.log('✅ Test 1 PASSED')
      console.log('📦 Response:', JSON.stringify(result.data, null, 2))
      console.log(`🎯 Confidence: ${result.confidence}`)
      console.log(`🔢 Tokens Used: ${result.tokensUsed || 'N/A'}`)
      console.log(`💭 Reasoning: ${result.reasoning || 'N/A'}\n`)
    } else {
      console.log('❌ Test 1 FAILED')
      console.log('Error:', result.error)
      process.exit(1)
    }
  } catch (error: any) {
    console.log('❌ Test 1 FAILED with exception')
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('─'.repeat(60))
  console.log('📊 Test 2: Audience Insights Analysis\n')
  
  try {
    const result = await aiReasoningEngine.analyzeAudienceInsights(testWebsiteContent)
    
    if (result.success) {
      console.log('✅ Test 2 PASSED')
      console.log('📦 Response:', JSON.stringify(result.data, null, 2))
      console.log(`🎯 Confidence: ${result.confidence}`)
      console.log(`🔢 Tokens Used: ${result.tokensUsed || 'N/A'}\n`)
    } else {
      console.log('❌ Test 2 FAILED')
      console.log('Error:', result.error)
      process.exit(1)
    }
  } catch (error: any) {
    console.log('❌ Test 2 FAILED with exception')
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log('─'.repeat(60))
  console.log('\n🎉 All tests passed! DeepSeek model is working correctly.\n')
  console.log('Model Info:', aiReasoningEngine.getModelInfo())
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
