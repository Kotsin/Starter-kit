import { Injectable } from '@nestjs/common';
import { ConfigService } from '@merchant-outline/config';
import axios from 'axios';

@Injectable()
export class CaptchaService {
  private readonly secretKey: string;
  private readonly verifyUrl =
    'https://www.google.com/recaptcha/api/siteverify';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get().captcha.secretKey;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(this.verifyUrl, null, {
        params: {
          secret: this.secretKey,
          response: token,
        },
      });

      return response.data.success;
    } catch (error) {
      console.error('Captcha verification failed:', error);

      return false;
    }
  }
}
