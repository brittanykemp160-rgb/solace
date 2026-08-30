// Simple in-memory cache with TTL

interface CacheEntry<T> {
  value: T;
  expires: number;
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    this.store.set(key, {
      value,
      expires: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
