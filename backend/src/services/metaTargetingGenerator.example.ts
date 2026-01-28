/**
 * Meta Targeting Generator - Usage Examples
 * 
 * This file demonstrates how to use the Meta Targeting Generator service
 * to create Meta Ads targeting recommendations.
 */

import { metaTargetingGenerator } from './metaTargetingGenerator.js'
import type { MetaTargetingInput } from './metaTargetingGenerator.js'
import type { WebsiteAnalysis } from '../models/types.js'

// ============================================================================
// Example 1: B2B SaaS Company
// ============================================================================

async function exampleB2BSaaS() {
  const websiteAnalysis: WebsiteAnalysis = {
    id: 'example-1',
    session_id: 'session-1',
    url: 'https://example-saas.com',
    business_model: 'B2B SaaS',
    value_propositions: [
      {
        proposition: 'Automate your team workflows in minutes',
        category: 'ease_of_use',
        strength: 0.9
      },
      {
        proposition: 'Save 10 hours per week on manual tasks',
        category: 'cost_savings',
        strength: 0.85
      }
    ],
    target_audience: {
      demographics: {
        job_titles: ['Marketing Manager', 'Operations Manager', 'CEO', 'Founder'],
        education_levels: ['College graduate', 'Graduate degree']
      },
      psychographics: {
        interests: ['Business automation', 'Productivity', 'SaaS tools']
      },
      pain_points: [
        'Spending too much time on manual tasks',
        'Difficulty coordinating team workflows'
      ],
      goals: [
        'Increase team productivity',
        'Automate repetitive processes'
      ],
      behaviors: [
        'Uses multiple SaaS tools',
        'Actively seeking productivity solutions'
      ]
    },
    content_themes: [
      {
        theme: 'Automation',
        keywords: ['automate', 'workflow', 'efficiency'],
        frequency: 25,
        relevance_score: 0.9
      },
      {
        theme: 'Productivity',
        keywords: ['productive', 'save time', 'efficient'],
        frequency: 18,
        relevance_score: 0.8
      }
    ],
    technical_metadata: {
      title: 'Workflow Automation Platform for Teams',
      description: 'Automate your business workflows and save time'
    },
    analysis_timestamp: new Date()
  }

  const input: MetaTargetingInput = {
    websiteAnalysis,
    targetLocation: 'United States'
  }

  // Generate targeting recommendations
  const targeting = await metaTargetingGenerator.generateTargeting(input)

  console.log('=== B2B SaaS Meta Targeting ===\n')
  
  console.log('Demographics:')
  console.log(`  Age: ${targeting.demographics.age_min}-${targeting.demographics.age_max}`)
  console.log(`  Locations: ${targeting.demographics.locations?.map(l => l.name).join(', ')}`)
  console.log(`  Education: ${targeting.demographics.education_levels?.join(', ')}`)
  console.log(`  Job Titles: ${targeting.demographics.job_titles?.join(', ')}\n`)

  console.log('Interests:')
  targeting.interests.forEach(interest => {
    console.log(`  ${interest.category} (${Math.round(interest.confidence * 100)}% confidence)`)
    console.log(`    - ${interest.interests.slice(0, 3).join(', ')}`)
    console.log(`    - ${interest.reasoning}\n`)
  })

  console.log('Behaviors:')
  targeting.behaviors.forEach(behavior => {
    console.log(`  ${behavior.category} (${Math.round(behavior.confidence * 100)}% confidence)`)
    console.log(`    - ${behavior.behaviors.slice(0, 2).join(', ')}`)
    console.log(`    - ${behavior.reasoning}\n`)
  })

  // Calculate confidence scores
  const confidenceScores = metaTargetingGenerator.calculateConfidenceScores(
    targeting,
    websiteAnalysis
  )

  console.log('Confidence Scores:')
  confidenceScores.forEach(score => {
    console.log(`  ${score.category}: ${Math.round(score.score * 100)}%`)
    score.factors.forEach(factor => console.log(`    - ${factor}`))
    console.log()
  })
}

// ============================================================================
// Example 2: E-commerce Store
// ============================================================================

async function exampleEcommerce() {
  const websiteAnalysis: WebsiteAnalysis = {
    id: 'example-2',
    session_id: 'session-2',
    url: 'https://example-store.com',
    business_model: 'E-commerce',
    value_propositions: [
      {
        proposition: 'Premium quality products at affordable prices',
        category: 'quality',
        strength: 0.85
      },
      {
        proposition: 'Free shipping on orders over $50',
        category: 'cost_savings',
        strength: 0.8
      }
    ],
    target_audience: {
      demographics: {
        age_ranges: ['25-34', '35-44'],
        genders: ['Female', 'Male']
      },
      psychographics: {
        interests: ['Online shopping', 'Fashion', 'Home decor']
      },
      behaviors: [
        'Frequent online shoppers',
        'Mobile shopping',
        'Price-conscious buyers'
      ]
    },
    content_themes: [
      {
        theme: 'Quality',
        keywords: ['premium', 'quality', 'best'],
        frequency: 20,
        relevance_score: 0.85
      },
      {
        theme: 'Value',
        keywords: ['affordable', 'deals', 'savings'],
        frequency: 15,
        relevance_score: 0.75
      }
    ],
    technical_metadata: {
      title: 'Premium Home & Fashion Store',
      description: 'Shop quality products at great prices'
    },
    analysis_timestamp: new Date()
  }

  const input: MetaTargetingInput = {
    websiteAnalysis,
    targetLocation: 'United States'
  }

  const targeting = await metaTargetingGenerator.generateTargeting(input)

  console.log('\n=== E-commerce Meta Targeting ===\n')
  
  console.log('Demographics:')
  console.log(`  Age: ${targeting.demographics.age_min}-${targeting.demographics.age_max}`)
  console.log(`  Genders: ${targeting.demographics.genders?.join(', ') || 'All'}`)
  console.log(`  Locations: ${targeting.demographics.locations?.map(l => l.name).join(', ')}\n`)

  console.log('Top Interest Categories:')
  targeting.interests.slice(0, 3).forEach(interest => {
    console.log(`  ${interest.category}: ${interest.interests.slice(0, 3).join(', ')}`)
  })

  console.log('\nCustom Audiences:')
  targeting.custom_audiences?.forEach(audience => {
    console.log(`  ${audience.type}: ${audience.description}`)
  })

  console.log('\nLookalike Audiences:')
  targeting.lookalike_suggestions?.forEach(lookalike => {
    console.log(`  ${lookalike.percentage}% - ${lookalike.description}`)
  })
}

// ============================================================================
// Example 3: Service Business
// ============================================================================

async function exampleServiceBusiness() {
  const websiteAnalysis: WebsiteAnalysis = {
    id: 'example-3',
    session_id: 'session-3',
    url: 'https://example-consulting.com',
    business_model: 'Consulting',
    value_propositions: [
      {
        proposition: '20+ years of industry expertise',
        category: 'quality',
        strength: 0.9
      },
      {
        proposition: 'Proven strategies that deliver results',
        category: 'quality',
        strength: 0.85
      }
    ],
    target_audience: {
      demographics: {
        job_titles: ['CEO', 'VP', 'Director', 'Senior Manager'],
        education_levels: ['College graduate', 'Graduate degree']
      },
      psychographics: {
        interests: ['Business strategy', 'Leadership', 'Management consulting']
      },
      pain_points: [
        'Need expert guidance for business transformation',
        'Struggling with strategic planning'
      ],
      goals: [
        'Improve business performance',
        'Implement effective strategies'
      ]
    },
    content_themes: [
      {
        theme: 'Expertise',
        keywords: ['expert', 'experienced', 'proven'],
        frequency: 22,
        relevance_score: 0.88
      }
    ],
    technical_metadata: {
      title: 'Strategic Business Consulting',
      description: 'Expert consulting services for business growth'
    },
    analysis_timestamp: new Date()
  }

  const input: MetaTargetingInput = {
    websiteAnalysis,
    targetLocation: 'United States'
  }

  const targeting = await metaTargetingGenerator.generateTargeting(input)
  const confidenceScores = metaTargetingGenerator.calculateConfidenceScores(
    targeting,
    websiteAnalysis
  )

  console.log('\n=== Consulting Service Meta Targeting ===\n')
  
  console.log('Demographics:')
  console.log(`  Age: ${targeting.demographics.age_min}-${targeting.demographics.age_max}`)
  console.log(`  Job Titles: ${targeting.demographics.job_titles?.join(', ')}`)
  console.log(`  Education: ${targeting.demographics.education_levels?.join(', ')}\n`)

  console.log('Overall Confidence Score:')
  const overallScore = confidenceScores.find(s => s.category === 'Overall Targeting')
  if (overallScore) {
    console.log(`  ${Math.round(overallScore.score * 100)}%`)
    overallScore.factors.forEach(factor => console.log(`  - ${factor}`))
  }
}

// ============================================================================
// Run Examples
// ============================================================================

async function runExamples() {
  try {
    await exampleB2BSaaS()
    await exampleEcommerce()
    await exampleServiceBusiness()
  } catch (error) {
    console.error('Error running examples:', error)
  }
}

// Uncomment to run examples:
// runExamples()

export { exampleB2BSaaS, exampleEcommerce, exampleServiceBusiness }
