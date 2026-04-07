import { clearTestKV } from '@/lib/kv'
import '@testing-library/jest-dom'

process.env.KV_TEST_PREFIX = 'test:'

beforeEach(async () => {
  // Clear all test KV keys before each test
  await clearTestKV()
})
