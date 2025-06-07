import pino from 'pino';

function getLogLevel(): string {
  if (typeof process !== 'undefined' && process.env && process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env.VITE_LOG_LEVEL || 'info';
  }
  return 'info';
}

const logger = pino({
  level: getLogLevel(),
  browser: { asObject: true },
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'headers.authorization',
      'body.password'
    ],
    censor: '[REDACTED]'
  }
});

export default logger;
