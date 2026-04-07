import { getTestKV, setTestKV, clearTestKV } from '@/lib/kv'

describe('KV helper functions', () => {
  it('exports KV functions', () => {
    expect(typeof getTestKV).toBe('function')
    expect(typeof setTestKV).toBe('function')
    expect(typeof clearTestKV).toBe('function')
  })
})
