import { HttpStatus } from '@nestjs/common';

export class CustomError extends Error {
  constructor(
    public readonly errorCode: number,
    public readonly message: string,
    public readonly details?: any, // Дополнительная информация
  ) {
    super(message);
  }
}

export enum CustomHttpStatus {
  USER_NOT_VERIFIED = 460,
  USER_ALREADY_EXISTS = 461,
  RESOURCE_CONFLICT = 463,
  AUTHENTICATION_FAILED = 464,
  ACCOUNT_CONFIRMATION_FAILED = 465,
  CONFIRMATION_CODE_SENDING_FAILED = 466,
}

export const ExtendedHttpStatus = {
  ...HttpStatus,
  ...CustomHttpStatus,
} as const;
