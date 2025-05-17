import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEmail, isMobilePhone } from 'class-validator';

@Injectable()
export class LoginValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }
    if (value.login) {
      if (isEmail(value.login)) {
        value.loginType = 'email';
      } else if (isMobilePhone(value.login)) {
        value.loginType = 'phone';
      } else {
        throw new BadRequestException('Некорректный формат логина');
      }
    }

    return value;
  }
}
