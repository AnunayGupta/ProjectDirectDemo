import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || '',
  token: process.env.KV_REST_API_TOKEN || ''
})

/** Site prefix — set KV_PREFIX=clinch: or KV_PREFIX=kestrel: per deployment */
function sitePrefix() {
  return process.env.KV_PREFIX || ''
}

export const kv = {
  get: <T>(key: string) => redis.get<T>(`${sitePrefix()}${key}`),
  set: (key: string, value: any) => redis.set(`${sitePrefix()}${key}`, value),
  del: (...keys: string[]) => redis.del(...keys.map(k => `${sitePrefix()}${k}`)),
  keys: (pattern: string) => redis.keys(`${sitePrefix()}${pattern}`),
}

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
