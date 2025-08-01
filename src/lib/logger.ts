import pino from 'pino';

const logger = pino({
  level: 'info',
  browser: {
    asObject: true,
  },
});

export const enhancedLogger = {
  log: (...args: Parameters<typeof logger.info>) => logger.info(...args),
  error: (...args: Parameters<typeof logger.error>) => logger.error(...args),
  warn: (...args: Parameters<typeof logger.warn>) => logger.warn(...args),
  info: (...args: Parameters<typeof logger.info>) => logger.info(...args),
  debug: (...args: Parameters<typeof logger.debug>) => logger.debug(...args),
};

export { logger };
export default enhancedLogger;
