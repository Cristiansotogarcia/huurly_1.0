import pino from 'pino';

const isBrowser = typeof window !== 'undefined';

/** Shared logger instance that works in both the browser and Node.js. */
export const logger = isBrowser
  ? pino({ browser: { asObject: true } })
  : pino();

// Convenience re-exports of common logging methods
export const { info, error, warn, debug, fatal } = logger;
