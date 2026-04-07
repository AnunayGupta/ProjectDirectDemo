import { Redis } from '@upstash/redis'

export const kv = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || ''
})

function prefix() {
  return process.env.KV_TEST_PREFIX || ''
}

export async function clearTestKV() {
  if (!process.env.KV_TEST_PREFIX) return
  try {
    const keys = await kv.keys(`${prefix()}*`)
    if (keys.length > 0) {
      await kv.del(...keys)
    }
  } catch (e) {
    // Ignore in case KV isn't properly hooked up yet
  }
}

export async function getTestKV(key: string) {
  return kv.get(`${prefix()}${key}`)
}

export async function setTestKV(key: string, value: any) {
  return kv.set(`${prefix()}${key}`, value)
}
