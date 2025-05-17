import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationFailedException extends HttpException {
  constructor(message: string = 'Authentication failed') {
    super(
      {
        status: HttpStatus.UNAUTHORIZED,
        error: 'Authentication failed',
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AccountConfirmationFailedException extends HttpException {
  constructor(message: string = 'Account confirmation failed') {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Confirmation failed',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class RegistrationFailedException extends HttpException {
  constructor(message: string = 'User registration failed') {
    super(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Registration failed',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TooManyAttemptsException extends HttpException {
  constructor(message: string = 'Too many attempts. Try again later') {
    super(
      {
        status: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Rate limit exceeded',
        message,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
} 