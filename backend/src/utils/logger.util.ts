import { logger as baseLogger } from '../config/pino.config';

class Logger {
  createLogger(module: string, context?: string) {
    return baseLogger.child({ module, ...(context && { context }) });
  }
}

export const logger = new Logger();