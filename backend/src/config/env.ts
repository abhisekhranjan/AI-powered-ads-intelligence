import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_PREFIX: z.string().default('/api'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('riseroutes_dev'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI Provider
  AI_PROVIDER: z.enum(['openai', 'openrouter', 'gemini', 'deepseek']).default('openrouter'),
  
  // OpenAI (Direct)
  OPENAI_API_KEY: z.string().optional(),
  
  // OpenRouter
  OPENROUTER_API_KEY: z.string().optional(),
  
  // Google Gemini
  GEMINI_API_KEY: z.string().optional(),
  
  // DeepSeek
  DEEPSEEK_API_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

// Export typed configuration
export const config = {
  env: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  apiPrefix: parsed.data.API_PREFIX,
  db: {
    host: parsed.data.DB_HOST,
    port: parsed.data.DB_PORT,
    user: parsed.data.DB_USER,
    password: parsed.data.DB_PASSWORD,
    name: parsed.data.DB_NAME,
  },
  redis: {
    host: parsed.data.REDIS_HOST,
    port: parsed.data.REDIS_PORT,
    password: parsed.data.REDIS_PASSWORD,
  },
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
  },
  ai: {
    provider: parsed.data.AI_PROVIDER,
    openaiKey: parsed.data.OPENAI_API_KEY,
    openrouterKey: parsed.data.OPENROUTER_API_KEY,
    geminiKey: parsed.data.GEMINI_API_KEY,
    deepseekKey: parsed.data.DEEPSEEK_API_KEY,
  },
  rateLimit: {
    windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    maxRequests: parsed.data.RATE_LIMIT_MAX_REQUESTS,
  },
  cors: {
    origin: parsed.data.CORS_ORIGIN,
  },
}
