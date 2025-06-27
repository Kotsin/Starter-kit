import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationFailedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Authentication failed',
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AccountConfirmationFailedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Account confirmation failed',
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class RegistrationFailedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Registration failed',
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class TooManyAttemptsException extends HttpException {
  constructor() {
    super(
      {
        message: 'Too many attempts. Try again later',
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class CaptchaVerificationFailedException extends HttpException {
  constructor() {
    super(
      {
        message: 'Captcha verification failed',
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
