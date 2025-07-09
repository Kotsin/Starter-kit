import { LoginMethod } from '@crypton-nestjs-kit/common';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEmail, isMobilePhone } from 'class-validator';
import { isAddress } from 'ethers';

@Injectable()
export class LoginValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    if (value.login) {
      if (isEmail(value.login)) {
        value.loginType = LoginMethod.EMAIL;
      } else if (isMobilePhone(value.login)) {
        value.loginType = LoginMethod.PHONE;
      } else if (isAddress(value.login)) {
        value.loginType = LoginMethod.WEB3;
      } else {
        throw new BadRequestException('Некорректный формат логина');
      }
    }

    return value;
  }
}
