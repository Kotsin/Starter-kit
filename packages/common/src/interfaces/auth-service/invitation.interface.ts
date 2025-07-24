import { IRequest } from '../../interfaces/entity-response.types';
import { IResponse } from '../response.interface';

export interface ICreateInvitationRequest extends IRequest {
  invitedUserRole: string;
  expiresAt: Date | string;
  channel: 'email' | 'phone';
  contact: string;
  userId: string;
}

export interface ICreateInvitationResponse extends IResponse {
  invitation?: any; // Можно заменить на тип InvitationEntity, если он доступен
}

export interface IGetInvitationsRequest extends IRequest {
  status?: 'active' | 'expired' | 'used' | 'cancelled';
  userId?: string;
  limit?: number;
  page?: number;
}

export interface IGetInvitationsResponse extends IResponse {
  invitations?: any[]; // Можно заменить на тип InvitationEntity[], если он доступен
  count?: number;
  page?: number;
  limit?: number;
}

export interface ICancelInvitationRequest extends IRequest {
  id: string;
  userId: string;
}

export interface ICancelInvitationResponse extends IResponse {
  invitation?: any;
}

export interface IUseInvitationRequest extends IRequest {
  code: string;
  usedBy: string;
}

export interface IUseInvitationResponse extends IResponse {
  invitation?: any;
}
