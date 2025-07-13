import { logger } from '../logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  
  // Rate limit configurations
  private readonly configs = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  };

  /**
   * Check if action is rate limited for a given identifier (IP, email, etc.)
   */
  isRateLimited(identifier: string, action: keyof typeof this.configs): boolean {
    const key = `${action}:${identifier}`;
    const config = this.configs[action];
    const now = Date.now();
    
    const entry = this.limits.get(key);
    
    if (!entry) {
      // First attempt
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return false;
    }
    
    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return false;
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxAttempts) {
      logger.warn(`Rate limit exceeded for ${action} by ${identifier}`);
      return true;
    }
    
    // Increment counter
    entry.count++;
    this.limits.set(key, entry);
    
    return false;
  }

  /**
   * Get time until rate limit resets (in seconds)
   */
  getTimeUntilReset(identifier: string, action: keyof typeof this.configs): number {
    const key = `${action}:${identifier}`;
    const entry = this.limits.get(key);
    
    if (!entry) {
      return 0;
    }
    
    const now = Date.now();
    const timeLeft = Math.max(0, entry.resetTime - now);
    
    return Math.ceil(timeLeft / 1000);
  }

  /**
   * Record an attempt for rate limiting
   */
  recordAttempt(identifier: string, action: keyof typeof this.configs): void {
    const key = `${action}:${identifier}`;
    const config = this.configs[action];
    const now = Date.now();
    
    const entry = this.limits.get(key);
    
    if (!entry) {
      // First attempt
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
    } else {
      // Check if window has expired
      if (now > entry.resetTime) {
        // Reset the counter
        this.limits.set(key, {
          count: 1,
          resetTime: now + config.windowMs
        });
      } else {
        // Increment counter
        entry.count++;
        this.limits.set(key, entry);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier and action
   */
  reset(identifier: string, action: keyof typeof this.configs): void {
    const key = `${action}:${identifier}`;
    this.limits.delete(key);
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);