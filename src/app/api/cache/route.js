import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

// Simple in-memory cache (for production, use Redis or similar)
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttl);
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  size() {
    return this.cache.size;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage()
    };
  }
}

const cache = new CacheManager();

// Cleanup expired cache entries every minute
setInterval(() => cache.cleanup(), 60000);

export async function GET() {
  try {
    const { key } = new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000').searchParams;
    
    if (key) {
      const value = cache.get(key);
      if (value !== null) {
        logger.debug(`Cache hit for key: ${key}`);
        return NextResponse.json({ 
          hit: true, 
          key, 
          value,
          timestamp: new Date().toISOString()
        });
      } else {
        logger.debug(`Cache miss for key: ${key}`);
        return NextResponse.json({ 
          hit: false, 
          key,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Return cache stats
    const stats = cache.getStats();
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Cache GET failed', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { key, value, ttl } = await new Request().json();
    
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
    }
    
    cache.set(key, value, ttl);
    logger.debug(`Cache set for key: ${key}`, { ttl });
    
    return NextResponse.json({
      success: true,
      key,
      ttl: ttl || cache.defaultTTL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Cache POST failed', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { key } = new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000').searchParams;
    
    if (key) {
      cache.delete(key);
      logger.debug(`Cache deleted for key: ${key}`);
      return NextResponse.json({
        success: true,
        key,
        timestamp: new Date().toISOString()
      });
    }
    
    // Clear all cache
    cache.clear();
    logger.info('Cache cleared');
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Cache DELETE failed', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Cache utility functions for use in other parts of the app
export function getCachedData(key) {
  return cache.get(key);
}

export function setCachedData(key, value, ttl) {
  return cache.set(key, value, ttl);
}

export function invalidateCache(key) {
  return cache.delete(key);
}

export function getCacheStats() {
  return cache.getStats();
}
