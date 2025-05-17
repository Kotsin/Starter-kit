import * as winston from 'winston';
import { addColors } from 'winston';

import { LogLevel } from './loglevel';

export class CustomLoggerService {
  private readonly logger: winston.Logger;
  constructor(private context: string) {
    addColors({ context: 'yellow' });
    const colorizer = winston.format.colorize();

    this.logger = winston.createLogger({
      level: LogLevel.Info,
    });
    this.logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize({ message: true, level: true }),
          winston.format.simple(),
          winston.format.printf(({ level, message, context }) => {
            return `${colorizer.colorize(
              'context',
              `[${context}]`,
            )} [${level}]: ${message}`;
          }),
        ),
        stderrLevels: [LogLevel.Error, LogLevel.Warn],
      }),
    );
  }

  setContext(context: string) {
    this.context = context;
  }

  error(message: string, context?: string) {
    this.logger.error(message, {
      context: context ? context : this.context,
    });
  }

  log(message: string, context?: string) {
    this.logger.log('info', message, {
      context: context ? context : this.context,
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, {
      context: context ? context : this.context,
    });
  }

  info(message: string, context?: string) {
    this.logger.info(message, {
      context: context ? context : this.context,
    });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, {
      context: context ? context : this.context,
    });
  }
}
