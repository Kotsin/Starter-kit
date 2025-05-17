import { SetMetadata } from '@nestjs/common';

export const API_KEY_METADATA = 'api_key';
export const ApiKey = (key: string) => SetMetadata(API_KEY_METADATA, key);
