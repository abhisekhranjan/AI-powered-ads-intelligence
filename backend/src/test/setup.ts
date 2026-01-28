/**
 * Test setup file for Vitest
 * Runs before all tests to configure the test environment
 */

import { beforeAll, afterAll, afterEach } from 'vitest'
import { pool } from '../config/database.js'

// Setup before all tests
beforeAll(async () => {
  // Test environment is ready
  console.log('🧪 Test environment initialized')
})

// Cleanup after each test
afterEach(async () => {
  // Clean up test data if needed
  // This can be expanded based on test requirements
})

// Cleanup after all tests
afterAll(async () => {
  // Close database connections
  await pool.end()
  console.log('🧹 Test environment cleaned up')
})
