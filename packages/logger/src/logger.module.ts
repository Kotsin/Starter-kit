import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from './logger.middleware';
import { CustomLoggerService } from './logger.service';

@Module({
  imports: [],
  controllers: [],
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class AppLoggerModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
