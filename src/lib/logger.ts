import pino from 'pino';

const logger = pino({
  level: 'info',
  browser: {
    asObject: true,
  },
});

export const enhancedLogger = {
  log: (...args: any[]) => logger.info(...args),
  error: (...args: any[]) => logger.error(...args),
  warn: (...args: any[]) => logger.warn(...args),
  info: (...args: any[]) => logger.info(...args),
  debug: (...args: any[]) => logger.debug(...args),
};

export { logger };
export default enhancedLogger;
