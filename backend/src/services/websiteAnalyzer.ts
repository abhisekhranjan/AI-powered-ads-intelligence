/**
 * Website Analyzer Service
 * Analyzes websites to extract business model, value propositions, and audience insights
 */

import puppeteer from 'puppeteer'
import { logger } from '../config/logger.js'
import { WebsiteAnalysis, CreateWebsiteAnalysisInput } from '../models/types.js'
import { websiteAnalysisRepository } from '../models/index.js'

export interface AnalysisOptions {
  timeout?: number
  waitForSelector?: string
}

export class WebsiteAnalyzerService {
  async analyzeWebsite(
    sessionId: string,
    url: string,
    options: AnalysisOptions = {}
  ): Promise<WebsiteAnalysis> {
    try {
      logger.info(`Starting website analysis for: ${url}`)

      // Extract content
      const content = await this.extractContent(url, options)

      // Analyze business model
      const businessModel = await this.identifyBusinessModel(content)

      // Extract value propositions
      const valuePropositions = await this.extractValuePropositions(content)

      // Analyze target audience
      const targetAudience = await this.analyzeAudience(content)

      // Extract content themes
      const contentThemes = await this.extractContentThemes(content)

      // Create analysis record
      const analysisInput: CreateWebsiteAnalysisInput = {
        session_id: sessionId,
        url,
        business_model: businessModel.type,
        value_propositions: valuePropositions,
        target_audience: targetAudience,
        content_themes: contentThemes,
        technical_metadata: content.metadata
      }

      const analysis = await websiteAnalysisRepository.createAnalysis(analysisInput)
      logger.info(`Website analysis completed for: ${url}`)

      return analysis
    } catch (error) {
      logger.error(`Website analysis failed for ${url}:`, error)
      throw error
    }
  }

  async extractContent(url: string, options: AnalysisOptions = {}) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: options.timeout || 30000 })

      const content = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          text: document.body.innerText,
          headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim() || ''),
          links: Array.from(document.querySelectorAll('a')).map(a => a.href)
        }
      })

      await browser.close()

      return {
        ...content,
        metadata: {
          title: content.title,
          description: content.description,
          page_load_time_ms: 0
        }
      }
    } catch (error) {
      await browser.close()
      throw error
    }
  }

  async identifyBusinessModel(content: any) {
    // Simple keyword-based classification
    const text = content.text.toLowerCase()

    if (text.includes('saas') || text.includes('software as a service')) {
      return { type: 'saas', description: 'Software as a Service', confidence: 0.8 }
    }
    if (text.includes('ecommerce') || text.includes('shop') || text.includes('buy now')) {
      return { type: 'ecommerce', description: 'E-commerce', confidence: 0.7 }
    }
    if (text.includes('consulting') || text.includes('services')) {
      return { type: 'service', description: 'Service Business', confidence: 0.6 }
    }

    return { type: 'other', description: 'Other', confidence: 0.5 }
  }

  async extractValuePropositions(content: any) {
    const headings = content.headings.slice(0, 5)
    return headings.map((heading: string, index: number) => ({
      proposition: heading,
      category: 'primary',
      strength: 1 - (index * 0.1)
    }))
  }

  async analyzeAudience(content: any) {
    return {
      demographics: {
        age_ranges: ['25-34', '35-44'],
        genders: ['all'],
        locations: ['United States']
      },
      pain_points: ['Need better solution', 'Looking for efficiency'],
      goals: ['Improve performance', 'Save time']
    }
  }

  async extractContentThemes(content: any) {
    const words = content.text.toLowerCase().split(/\s+/)
    const wordCount: Record<string, number> = {}

    words.forEach((word: string) => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })

    const topWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return topWords.map(([word, count]) => ({
      theme: word,
      keywords: [word],
      frequency: count,
      relevance_score: count / words.length
    }))
  }
}

export const websiteAnalyzerService = new WebsiteAnalyzerService()
