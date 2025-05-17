import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SessionsController } from './sessions.controller';
import { LockService } from './services/lock.service';

@Module({
  controllers: [AuthController, SessionsController],
  providers: [LockService],
})
export class AuthModule {} 