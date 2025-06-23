
import pino from 'pino';

const logger = pino({
  level: 'info',
  browser: {
    asObject: true
  }
});

// Enhanced logger with additional methods
export const enhancedLogger = {
  log: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.warn(...args),
  info: (...args: any[]) => console.info(...args),
  debug: (...args: any[]) => console.debug(...args),
};

export { logger };
export default enhancedLogger;
