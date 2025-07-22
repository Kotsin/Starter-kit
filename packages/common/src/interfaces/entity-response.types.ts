import { ITwoFaCodes } from './auth-service';

export interface IRequest {
  traceId?: string;
  limit?: number;
  page?: number;
  serviceId?: string;
  twoFaCodes?: ITwoFaCodes[];
}
