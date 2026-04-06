// In-memory KV fallback for local dev (when Vercel KV isn't configured)
// Provides the same interface as @vercel/kv so API routes work without changes.

const memStore = new Map<string, unknown>();

interface SortedSetMember {
  score: number;
  member: string;
}

const memSortedSets = new Map<string, SortedSetMember[]>();
const memLists = new Map<string, string[]>();

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

let realKv: typeof import("@vercel/kv").kv | null = null;

async function getRealKv() {
  if (!realKv) {
    const mod = await import("@vercel/kv");
    realKv = mod.kv;
  }
  return realKv;
}

// Unified kv interface that falls back to in-memory when KV isn't configured
export const kv = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      return r.get<T>(key);
    }
    return (memStore.get(key) as T) ?? null;
  },

  async set(key: string, value: unknown): Promise<void> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      await r.set(key, value);
      return;
    }
    memStore.set(key, value);
  },

  async zadd(key: string, ...members: SortedSetMember[]): Promise<number> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result = 0;
      for (const m of members) {
        const res = await r.zadd(key, { score: m.score, member: m.member });
        result += res ?? 0;
      }
      return result;
    }
    const set = memSortedSets.get(key) ?? [];
    for (const m of members) {
      const idx = set.findIndex((s) => s.member === m.member);
      if (idx >= 0) set[idx] = m;
      else set.push(m);
    }
    set.sort((a, b) => a.score - b.score);
    memSortedSets.set(key, set);
    return members.length;
  },

  async zcard(key: string): Promise<number> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      return r.zcard(key);
    }
    return (memSortedSets.get(key) ?? []).length;
  },

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      return r.zrange(key, start, stop);
    }
    const set = memSortedSets.get(key) ?? [];
    const end = stop === -1 ? set.length : stop + 1;
    return set.slice(start, end).map((s) => s.member);
  },

  async lpush(key: string, ...values: string[]): Promise<number> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      return r.lpush(key, ...values);
    }
    const list = memLists.get(key) ?? [];
    list.unshift(...values);
    memLists.set(key, list);
    return list.length;
  },

  async llen(key: string): Promise<number> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      return r.llen(key);
    }
    return (memLists.get(key) ?? []).length;
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (isKvConfigured()) {
      const r = await getRealKv();
      return r.lrange(key, start, stop);
    }
    const list = memLists.get(key) ?? [];
    const end = stop === -1 ? list.length : stop + 1;
    return list.slice(start, end);
  },
};

export const FIRM_KEY = (firmId: string) => `firm:${firmId}`;
export const STRATEGY_KEY = (strategyId: string) => `strategy:${strategyId}`;
export const STRATEGIES_INDEX_KEY = (firmId: string) => `firm:${firmId}:strategies`;
export const BROADCAST_KEY = (broadcastId: string) => `broadcast:${broadcastId}`;
export const BROADCASTS_INDEX_KEY = (firmId: string) => `broadcasts:${firmId}`;
