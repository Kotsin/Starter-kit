import { ITwoFaCodes } from './auth-service';

export type DefaultResponse = Promise<{ status: boolean; message: string }>;

export interface IRequest {
  traceId?: string;
  limit?: number;
  page?: number;
  serviceId?: string;
  twoFaCodes?: ITwoFaCodes[];
}
