/**
 * Business Model Classifier Tests
 * Tests for AI-powered business model detection, value proposition extraction, and audience signal identification
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BusinessModelClassifier, WebsiteContent, BUSINESS_MODEL_TYPES } from './businessModelClassifier.js'

describe('BusinessModelClassifier', () => {
  let classifier: BusinessModelClassifier

  beforeEach(() => {
    classifier = new BusinessModelClassifier()
  })

  describe('B2B SaaS Detection', () => {
    it('should detect B2B SaaS from enterprise-focused content', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Enterprise Workflow Automation Platform',
        description: 'Automate your team workflows with our powerful API and integrations',
        headings: [
          'Enterprise Workflow Automation',
          'Powerful API Integration',
          'Team Collaboration Dashboard',
          'Analytics & Reporting'
        ],
        paragraphs: [
          'Our platform helps enterprise teams automate complex workflows',
          'Integrate with your existing tools via our REST API',
          'Get real-time analytics and insights for your team'
        ],
        ctaButtons: ['Schedule a Demo', 'Start Free Trial', 'Contact Sales'],
        navigationLinks: ['Pricing', 'Features', 'API Docs', 'Enterprise']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.businessModel.type).toBe('B2B SaaS')
      expect(result.businessModel.confidence).toBeGreaterThanOrEqual(0.5)
      expect(result.confidence).toBeGreaterThan(0.3) // Overall confidence includes all factors
    })
  })

  describe('E-commerce Detection', () => {
    it('should detect E-commerce from shopping-focused content', async () => {
      const content: WebsiteContent = {
        url: 'https://shop.example.com',
        title: 'Premium Products - Shop Now',
        description: 'Shop our collection of premium products with free shipping',
        headings: [
          'Shop Our Collection',
          'New Arrivals',
          'Free Shipping on Orders Over $50',
          'Easy Returns'
        ],
        paragraphs: [
          'Browse our wide selection of products',
          'Add items to your cart and checkout securely',
          'We offer free shipping and 30-day returns'
        ],
        ctaButtons: ['Add to Cart', 'Buy Now', 'Shop Now'],
        navigationLinks: ['Products', 'Cart', 'Checkout', 'Shipping']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.businessModel.type).toBe('E-commerce')
      expect(result.businessModel.confidence).toBeGreaterThan(0.5)
    })
  })

  describe('Service Business Detection', () => {
    it('should detect Service Business from local service content', async () => {
      const content: WebsiteContent = {
        url: 'https://localservice.example.com',
        title: 'Professional Services Near You',
        description: 'Book an appointment for professional services in your area',
        headings: [
          'Professional Services',
          'Book Your Appointment',
          'Service Areas',
          'Contact Us Today'
        ],
        paragraphs: [
          'We provide professional services to local customers',
          'Schedule a consultation with our team',
          'Serving the greater metro area'
        ],
        ctaButtons: ['Book Appointment', 'Schedule Consultation', 'Contact Us'],
        navigationLinks: ['Services', 'Locations', 'Contact', 'About']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.businessModel.type).toBe('Service Business')
      expect(result.businessModel.confidence).toBeGreaterThan(0.3)
    })
  })

  describe('Agency Detection', () => {
    it('should detect Agency from creative agency content', async () => {
      const content: WebsiteContent = {
        url: 'https://agency.example.com',
        title: 'Creative Digital Marketing Agency',
        description: 'Award-winning agency delivering creative solutions for clients',
        headings: [
          'Creative Digital Agency',
          'Our Portfolio',
          'Case Studies',
          'Client Success Stories'
        ],
        paragraphs: [
          'We are a creative agency specializing in digital marketing',
          'View our portfolio of successful client projects',
          'Our team delivers innovative branding and design solutions'
        ],
        ctaButtons: ['View Portfolio', 'Start a Project', 'Contact Us'],
        navigationLinks: ['Portfolio', 'Services', 'Clients', 'Case Studies']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.businessModel.type).toBe('Agency')
      expect(result.businessModel.confidence).toBeGreaterThan(0.5)
    })
  })

  describe('Value Proposition Extraction', () => {
    it('should extract value propositions from headings', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Save Time and Money',
        description: 'The fastest way to grow your business',
        headings: [
          'Save 10 Hours Per Week',
          'Reduce Costs by 50%',
          'Easy to Use Platform',
          'Trusted by 10,000+ Companies'
        ],
        paragraphs: ['Our platform helps you save time and money'],
        ctaButtons: ['Get Started Free'],
        navigationLinks: ['Features', 'Pricing']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.valuePropositions.length).toBeGreaterThan(0)
      expect(result.valuePropositions.some(vp => vp.category === 'cost_savings')).toBe(true)
      expect(result.valuePropositions.some(vp => vp.strength > 0.5)).toBe(true)
    })

    it('should categorize value propositions correctly', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Fast and Secure Platform',
        description: 'The most secure way to manage your data',
        headings: [
          'Lightning Fast Performance',
          'Bank-Level Security and Protection',
          'Simple and Intuitive Interface',
          'Premium Quality Service'
        ],
        paragraphs: ['Fast, secure, and easy to use platform with trusted security'],
        ctaButtons: ['Try It Now'],
        navigationLinks: ['Features']
      }

      const result = await classifier.classifyBusinessModel(content)

      const categories = result.valuePropositions.map(vp => vp.category)
      // Check that we have multiple categories
      expect(categories.length).toBeGreaterThan(0)
      // Check for at least one expected category
      expect(categories.some(cat => ['speed', 'security', 'ease_of_use', 'quality', 'overview'].includes(cat))).toBe(true)
    })
  })

  describe('Audience Signal Identification', () => {
    it('should identify job titles from content', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Tools for CEOs and Managers',
        description: 'Built for executives, managers, and entrepreneurs',
        headings: [
          'For CEOs and Founders',
          'Manager Dashboard',
          'Executive Analytics'
        ],
        paragraphs: [
          'Our platform is designed for CEOs, CTOs, and marketing managers',
          'Entrepreneurs and founders love our tools'
        ],
        ctaButtons: ['Get Started'],
        navigationLinks: ['Features']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.audienceSignals.demographics?.job_titles).toBeDefined()
      expect(result.audienceSignals.demographics!.job_titles!.length).toBeGreaterThan(0)
      expect(result.audienceSignals.demographics!.job_titles).toContain('ceo')
    })

    it('should extract pain points from content', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Stop Wasting Time',
        description: 'Solve your biggest challenges',
        headings: ['Tired of Manual Work?', 'Struggling with Inefficiency?'],
        paragraphs: [
          'Are you frustrated by slow manual processes that waste hours every day?',
          'Many businesses struggle with inefficient workflows and lose productivity',
          'The challenge of managing multiple tools is a common pain point'
        ],
        ctaButtons: ['Solve This Problem'],
        navigationLinks: ['Solutions']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.audienceSignals.pain_points).toBeDefined()
      expect(result.audienceSignals.pain_points!.length).toBeGreaterThan(0)
    })

    it('should extract goals from content', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Grow Your Business',
        description: 'Achieve your goals faster',
        headings: [
          'Grow Revenue by 50%',
          'Increase Productivity',
          'Improve Team Performance',
          'Achieve Your Goals'
        ],
        paragraphs: ['Help your team succeed and reach new heights'],
        ctaButtons: ['Start Growing'],
        navigationLinks: ['Features']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.audienceSignals.goals).toBeDefined()
      expect(result.audienceSignals.goals!.length).toBeGreaterThan(0)
    })

    it('should extract behaviors from content', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'For Tech-Savvy Professionals',
        description: 'Built for early adopters and online shopping enthusiasts',
        headings: ['Perfect for Mobile Users', 'For Tech-Savvy Teams'],
        paragraphs: [
          'Our platform is ideal for tech-savvy professionals who love online shopping',
          'Early adopters and mobile users will appreciate our features'
        ],
        ctaButtons: ['Try It'],
        navigationLinks: ['Features']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.audienceSignals.behaviors).toBeDefined()
      expect(result.audienceSignals.behaviors!.length).toBeGreaterThan(0)
    })
  })

  describe('Content Theme Extraction', () => {
    it('should extract content themes from text', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Fast, Secure, and Reliable',
        description: 'The most secure and reliable platform',
        headings: [
          'Lightning Fast Performance',
          'Bank-Level Security',
          'Trusted and Reliable',
          'Premium Quality'
        ],
        paragraphs: [
          'Our platform is fast, efficient, and optimized for performance',
          'We provide secure, trusted, and reliable service with 24/7 support',
          'Quality and excellence are our top priorities'
        ],
        ctaButtons: ['Get Started'],
        navigationLinks: ['Features']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.contentThemes.length).toBeGreaterThan(0)
      expect(result.contentThemes.some(theme => theme.theme === 'Performance')).toBe(true)
      expect(result.contentThemes.some(theme => theme.theme === 'Trust & Security')).toBe(true)
      expect(result.contentThemes.every(theme => theme.relevance_score > 0)).toBe(true)
    })

    it('should rank themes by relevance', async () => {
      const content: WebsiteContent = {
        url: 'https://example.com',
        title: 'Easy to Use',
        description: 'Simple and intuitive platform',
        headings: ['Easy Setup', 'Simple Interface', 'User-Friendly Design'],
        paragraphs: [
          'Our platform is easy, simple, and intuitive to use',
          'Straightforward and effortless for everyone',
          'User-friendly interface makes it simple'
        ],
        ctaButtons: ['Try It'],
        navigationLinks: ['Features']
      }

      const result = await classifier.classifyBusinessModel(content)

      expect(result.contentThemes.length).toBeGreaterThan(0)
      // The first theme should have the highest relevance score
      if (result.contentThemes.length > 1) {
        expect(result.contentThemes[0].relevance_score).toBeGreaterThanOrEqual(
          result.contentThemes[1].relevance_score
        )
      }
    })
  })

  describe('Overall Confidence Calculation', () => {
    it('should calculate higher confidence for rich content', async () => {
      const richContent: WebsiteContent = {
        url: 'https://example.com',
        title: 'Enterprise SaaS Platform for Teams',
        description: 'Powerful workflow automation with API integration',
        headings: [
          'Enterprise Workflow Automation',
          'Save 10 Hours Per Week',
          'Trusted by 5000+ Companies',
          'API Integration',
          'Team Dashboard'
        ],
        paragraphs: [
          'Our enterprise platform helps teams automate workflows',
          'Integrate with your existing tools via our powerful API',
          'Designed for CEOs, managers, and technical teams',
          'Struggling with manual processes? We can help',
          'Achieve your productivity goals faster'
        ],
        ctaButtons: ['Schedule Demo', 'Start Free Trial', 'View Pricing'],
        navigationLinks: ['Features', 'Pricing', 'API', 'Enterprise', 'Support']
      }

      const result = await classifier.classifyBusinessModel(richContent)

      expect(result.confidence).toBeGreaterThan(0.5)
      expect(result.valuePropositions.length).toBeGreaterThan(2)
      expect(result.contentThemes.length).toBeGreaterThan(2)
    })

    it('should calculate lower confidence for sparse content', async () => {
      const sparseContent: WebsiteContent = {
        url: 'https://example.com',
        title: 'Welcome',
        description: 'Our website',
        headings: ['Home', 'About'],
        paragraphs: ['Welcome to our site'],
        ctaButtons: ['Click Here'],
        navigationLinks: ['Home', 'About']
      }

      const result = await classifier.classifyBusinessModel(sparseContent)

      expect(result.confidence).toBeLessThan(0.7)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', async () => {
      const emptyContent: WebsiteContent = {
        url: 'https://example.com',
        headings: [],
        paragraphs: [],
        ctaButtons: [],
        navigationLinks: []
      }

      const result = await classifier.classifyBusinessModel(emptyContent)

      expect(result.businessModel).toBeDefined()
      expect(result.valuePropositions).toBeDefined()
      expect(result.audienceSignals).toBeDefined()
      expect(result.contentThemes).toBeDefined()
    })

    it('should handle content with special characters', async () => {
      const specialContent: WebsiteContent = {
        url: 'https://example.com',
        title: 'Save 50% & Get Started!',
        description: 'Fast, secure & reliable - #1 platform',
        headings: ['#1 Solution', 'Save $$$', 'Try It @ No Cost'],
        paragraphs: ['Special offer: 50% off! Sign up @ example.com'],
        ctaButtons: ['Get Started!', 'Learn More >>'],
        navigationLinks: ['Home', 'Pricing ($)', 'Contact']
      }

      const result = await classifier.classifyBusinessModel(specialContent)

      expect(result.businessModel).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should handle very long content', async () => {
      const longParagraph = 'Lorem ipsum '.repeat(1000)
      const longContent: WebsiteContent = {
        url: 'https://example.com',
        title: 'Enterprise Platform',
        description: 'Business software',
        headings: Array(50).fill('Feature Heading'),
        paragraphs: Array(100).fill(longParagraph),
        ctaButtons: Array(20).fill('Click Here'),
        navigationLinks: Array(30).fill('Link')
      }

      const result = await classifier.classifyBusinessModel(longContent)

      expect(result.businessModel).toBeDefined()
      expect(result.valuePropositions.length).toBeLessThanOrEqual(5)
      expect(result.contentThemes.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Business Model Types Coverage', () => {
    it('should support all defined business model types', () => {
      expect(BUSINESS_MODEL_TYPES.length).toBeGreaterThan(10)
      expect(BUSINESS_MODEL_TYPES).toContain('B2B SaaS')
      expect(BUSINESS_MODEL_TYPES).toContain('E-commerce')
      expect(BUSINESS_MODEL_TYPES).toContain('Agency')
    })
  })
})
