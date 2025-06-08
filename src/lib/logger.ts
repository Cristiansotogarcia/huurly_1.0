import pino from 'pino';
const isBrowser = typeof window !== 'undefined';
export const logger = isBrowser
  ? pino({ browser: { asObject: true }, level: 'info' })
  : pino({ transport: { target: 'pino-pretty' }, level: process.env.LOG_LEVEL || 'info' });
