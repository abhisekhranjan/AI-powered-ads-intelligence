/**
 * AI Reasoning Engine Usage Examples
 * 
 * This file demonstrates how to use the AI Reasoning Engine service
 * for various analysis tasks.
 */

import { aiReasoningEngine } from './aiReasoningEngine.js'
import { AudienceInsights } from '../models/types.js'

// ============================================================================
// Example 1: Business Model Analysis
// ============================================================================

async function exampleBusinessModelAnalysis() {
  console.log('\n=== Example 1: Business Model Analysis ===\n')

  const websiteContent = {
    url: 'https://example-saas.com',
    title: 'Enterprise Workflow Automation Platform',
    description: 'Automate your team workflows with our cloud-based platform. Free trial available.',
    text: `
      Transform your business operations with our enterprise workflow automation platform.
      Our cloud-based solution helps teams collaborate more effectively, automate repetitive tasks,
      and gain insights through powerful analytics. Trusted by over 10,000 companies worldwide.
      
      Features include: API integrations, custom workflows, real-time collaboration,
      advanced reporting, and enterprise-grade security. Start your 14-day free trial today.
    `,
    headings: [
      'Enterprise Workflow Automation',
      'Powerful Integrations',
      'Real-time Collaboration',
      'Advanced Analytics',
      'Enterprise Security'
    ]
  }

  try {
    const result = await aiReasoningEngine.analyzeBusinessModel(websiteContent)

    if (result.success) {
      console.log('✅ Business Model Analysis Successful')
      console.log('Business Model Type:', result.data.type)
      console.log('Description:', result.data.description)
      console.log('Confidence:', result.data.confidence)
      console.log('Reasoning:', result.reasoning)
      console.log('Tokens Used:', result.tokensUsed)
    } else {
      console.error('❌ Analysis Failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ============================================================================
// Example 2: Audience Insights Analysis
// ============================================================================

async function exampleAudienceInsightsAnalysis() {
  console.log('\n=== Example 2: Audience Insights Analysis ===\n')

  const websiteContent = {
    url: 'https://example-saas.com',
    title: 'Enterprise Workflow Automation Platform',
    businessModel: {
      type: 'B2B SaaS',
      description: 'Software-as-a-Service targeting business customers',
      confidence: 0.9
    },
    valuePropositions: [
      {
        proposition: 'Automate repetitive tasks and save 10+ hours per week',
        category: 'efficiency',
        strength: 0.9
      },
      {
        proposition: 'Enterprise-grade security and compliance',
        category: 'security',
        strength: 0.85
      }
    ],
    text: `
      Are you tired of wasting time on manual data entry and repetitive tasks?
      Our platform helps operations managers and team leaders streamline their workflows,
      reduce errors, and focus on strategic initiatives. Perfect for mid-size to enterprise
      companies looking to scale their operations efficiently.
    `
  }

  try {
    const result = await aiReasoningEngine.analyzeAudienceInsights(websiteContent)

    if (result.success) {
      console.log('✅ Audience Insights Analysis Successful')
      console.log('\nDemographics:')
      console.log('  Age Ranges:', result.data.demographics?.age_ranges)
      console.log('  Job Titles:', result.data.demographics?.job_titles)
      console.log('  Income Level:', result.data.demographics?.income_level)
      
      console.log('\nPsychographics:')
      console.log('  Interests:', result.data.psychographics?.interests)
      console.log('  Values:', result.data.psychographics?.values)
      
      console.log('\nPain Points:', result.data.pain_points)
      console.log('Goals:', result.data.goals)
      console.log('Behaviors:', result.data.behaviors)
      
      console.log('\nConfidence:', result.confidence)
      console.log('Tokens Used:', result.tokensUsed)
    } else {
      console.error('❌ Analysis Failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ============================================================================
// Example 3: Meta Ads Targeting Recommendations
// ============================================================================

async function exampleMetaTargeting() {
  console.log('\n=== Example 3: Meta Ads Targeting Recommendations ===\n')

  const websiteContent = {
    url: 'https://example-saas.com',
    title: 'Enterprise Workflow Automation Platform',
    businessModel: {
      type: 'B2B SaaS',
      description: 'Software-as-a-Service targeting business customers',
      confidence: 0.9
    },
    valuePropositions: [
      {
        proposition: 'Automate workflows and save time',
        category: 'efficiency',
        strength: 0.9
      }
    ],
    text: 'Enterprise workflow automation platform for teams...'
  }

  const audienceInsights: AudienceInsights = {
    demographics: {
      age_ranges: ['30-44', '45-54'],
      job_titles: ['Operations Manager', 'IT Director', 'Business Owner'],
      income_level: 'Upper middle to high income'
    },
    psychographics: {
      interests: ['Business automation', 'Technology', 'Productivity'],
      values: ['Efficiency', 'Innovation', 'Results']
    },
    pain_points: [
      'Wasting time on manual tasks',
      'Difficulty scaling operations',
      'Lack of process visibility'
    ],
    goals: [
      'Increase team productivity',
      'Reduce operational costs',
      'Scale business efficiently'
    ],
    behaviors: [
      'Actively researching business software',
      'Comparing multiple solutions',
      'Reading industry blogs and reviews'
    ]
  }

  try {
    const result = await aiReasoningEngine.generateMetaTargeting(
      websiteContent,
      audienceInsights
    )

    if (result.success) {
      console.log('✅ Meta Targeting Recommendations Generated')
      
      console.log('\nDemographics:')
      console.log('  Age Ranges:', result.data.demographics.age_ranges)
      console.log('  Genders:', result.data.demographics.genders)
      console.log('  Locations:', result.data.demographics.locations)
      
      console.log('\nInterests:')
      result.data.interests.forEach((interest: any, index: number) => {
        console.log(`  ${index + 1}. ${interest.category}`)
        console.log(`     Specific: ${interest.specific_interests.join(', ')}`)
        console.log(`     Reasoning: ${interest.reasoning}`)
      })
      
      console.log('\nBehaviors:')
      result.data.behaviors.forEach((behavior: any, index: number) => {
        console.log(`  ${index + 1}. ${behavior.behavior}`)
        console.log(`     Reasoning: ${behavior.reasoning}`)
      })
      
      console.log('\nCustom Audiences:')
      result.data.custom_audiences.forEach((audience: any, index: number) => {
        console.log(`  ${index + 1}. ${audience.type}`)
        console.log(`     ${audience.description}`)
      })
      
      console.log('\nLookalike Suggestions:')
      result.data.lookalike_suggestions.forEach((lookalike: any, index: number) => {
        console.log(`  ${index + 1}. ${lookalike.percentage}% - ${lookalike.source}`)
      })
      
      console.log('\nOverall Confidence:', result.confidence)
      console.log('Tokens Used:', result.tokensUsed)
    } else {
      console.error('❌ Analysis Failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ============================================================================
// Example 4: Google Ads Targeting Recommendations
// ============================================================================

async function exampleGoogleTargeting() {
  console.log('\n=== Example 4: Google Ads Targeting Recommendations ===\n')

  const websiteContent = {
    url: 'https://example-saas.com',
    title: 'Enterprise Workflow Automation Platform',
    businessModel: {
      type: 'B2B SaaS',
      description: 'Software-as-a-Service targeting business customers',
      confidence: 0.9
    },
    valuePropositions: [
      {
        proposition: 'Automate workflows and save time',
        category: 'efficiency',
        strength: 0.9
      }
    ],
    text: 'Enterprise workflow automation platform for teams...'
  }

  const audienceInsights: AudienceInsights = {
    pain_points: [
      'Wasting time on manual tasks',
      'Difficulty scaling operations'
    ],
    goals: [
      'Increase team productivity',
      'Reduce operational costs'
    ],
    behaviors: [
      'Actively researching business software',
      'Comparing multiple solutions'
    ]
  }

  try {
    const result = await aiReasoningEngine.generateGoogleTargeting(
      websiteContent,
      audienceInsights
    )

    if (result.success) {
      console.log('✅ Google Targeting Recommendations Generated')
      
      console.log('\nKeyword Clusters:')
      result.data.keyword_clusters.forEach((cluster: any, index: number) => {
        console.log(`\n  Cluster ${index + 1}: ${cluster.intent}`)
        console.log('  Keywords:')
        cluster.keywords.forEach((kw: any) => {
          console.log(`    - "${kw.keyword}" [${kw.match_type}] (${kw.estimated_volume})`)
        })
        console.log(`  Reasoning: ${cluster.reasoning}`)
      })
      
      console.log('\nAudiences:')
      result.data.audiences.forEach((audience: any, index: number) => {
        console.log(`  ${index + 1}. ${audience.type}`)
        console.log(`     ${audience.description}`)
        console.log(`     Reasoning: ${audience.reasoning}`)
      })
      
      console.log('\nDemographics:')
      console.log('  Age Ranges:', result.data.demographics.age_ranges)
      console.log('  Household Income:', result.data.demographics.household_income)
      
      console.log('\nPlacements:')
      result.data.placements.forEach((placement: any, index: number) => {
        console.log(`  ${index + 1}. ${placement.type}`)
        console.log(`     Examples: ${placement.examples.join(', ')}`)
      })
      
      console.log('\nOverall Confidence:', result.confidence)
      console.log('Tokens Used:', result.tokensUsed)
    } else {
      console.error('❌ Analysis Failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ============================================================================
// Example 5: Value Proposition Extraction
// ============================================================================

async function exampleValuePropositionExtraction() {
  console.log('\n=== Example 5: Value Proposition Extraction ===\n')

  const websiteContent = {
    url: 'https://example-saas.com',
    title: 'Save 10+ Hours Per Week with Automated Workflows',
    description: 'The fastest way to automate your business processes. Trusted by 10,000+ companies.',
    text: `
      Stop wasting time on repetitive tasks. Our platform automates your workflows
      so you can focus on what matters. Get started in minutes, not months.
      
      Enterprise-grade security. 99.9% uptime guarantee. 24/7 support.
      Join thousands of companies who have transformed their operations.
    `,
    headings: [
      'Save 10+ Hours Per Week',
      'Set Up in Minutes',
      'Enterprise Security',
      'Trusted by 10,000+ Companies',
      'Start Your Free Trial'
    ]
  }

  try {
    const result = await aiReasoningEngine.extractValuePropositions(websiteContent)

    if (result.success) {
      console.log('✅ Value Propositions Extracted')
      
      console.log('\nPrimary Value:', result.data.primary_value)
      
      console.log('\nValue Propositions:')
      result.data.value_propositions?.forEach((vp: any, index: number) => {
        console.log(`\n  ${index + 1}. ${vp.proposition}`)
        console.log(`     Category: ${vp.category}`)
        console.log(`     Strength: ${vp.strength}`)
        console.log(`     Reasoning: ${vp.reasoning}`)
      })
      
      console.log('\nConfidence:', result.confidence)
      console.log('Tokens Used:', result.tokensUsed)
    } else {
      console.error('❌ Analysis Failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ============================================================================
// Example 6: Content Theme Analysis
// ============================================================================

async function exampleContentThemeAnalysis() {
  console.log('\n=== Example 6: Content Theme Analysis ===\n')

  const websiteContent = {
    url: 'https://example-saas.com',
    title: 'Enterprise Workflow Automation Platform',
    businessModel: {
      type: 'B2B SaaS',
      description: 'Software-as-a-Service targeting business customers',
      confidence: 0.9
    },
    text: `
      Our innovative platform leverages cutting-edge technology to deliver
      secure, reliable automation solutions. We're trusted by industry leaders
      for our commitment to quality and performance. Our dedicated support team
      ensures you get the most value from your investment. Fast implementation,
      powerful features, and seamless integration with your existing tools.
    `
  }

  try {
    const result = await aiReasoningEngine.analyzeContentThemes(websiteContent)

    if (result.success) {
      console.log('✅ Content Themes Analyzed')
      
      console.log('\nMessaging Tone:', result.data.messaging_tone)
      console.log('Brand Personality:', result.data.brand_personality?.join(', '))
      
      console.log('\nThemes:')
      result.data.themes?.forEach((theme: any, index: number) => {
        console.log(`\n  ${index + 1}. ${theme.theme}`)
        console.log(`     Keywords: ${theme.keywords.join(', ')}`)
        console.log(`     Frequency: ${theme.frequency}`)
        console.log(`     Relevance: ${theme.relevance_score}`)
        console.log(`     Reasoning: ${theme.reasoning}`)
      })
      
      console.log('\nConfidence:', result.confidence)
      console.log('Tokens Used:', result.tokensUsed)
    } else {
      console.error('❌ Analysis Failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples() {
  console.log('='.repeat(80))
  console.log('AI REASONING ENGINE - USAGE EXAMPLES')
  console.log('='.repeat(80))

  // Check if OpenAI is configured
  if (!aiReasoningEngine.isConfigured()) {
    console.error('\n❌ ERROR: OpenAI API key not configured!')
    console.error('Please set OPENAI_API_KEY in your .env file\n')
    return
  }

  console.log('\n✅ OpenAI API configured')
  console.log('Model Info:', aiReasoningEngine.getModelInfo())

  try {
    await exampleBusinessModelAnalysis()
    await exampleAudienceInsightsAnalysis()
    await exampleMetaTargeting()
    await exampleGoogleTargeting()
    await exampleValuePropositionExtraction()
    await exampleContentThemeAnalysis()

    console.log('\n' + '='.repeat(80))
    console.log('All examples completed successfully!')
    console.log('='.repeat(80) + '\n')
  } catch (error) {
    console.error('\n❌ Error running examples:', error)
  }
}

// Uncomment to run examples:
// runAllExamples()

// Export for use in other files
export {
  exampleBusinessModelAnalysis,
  exampleAudienceInsightsAnalysis,
  exampleMetaTargeting,
  exampleGoogleTargeting,
  exampleValuePropositionExtraction,
  exampleContentThemeAnalysis,
  runAllExamples
}
