import { UserStatus, UserType } from '../../../enums';

export interface User {
  id: string;
  fullName: string | null;
  username: string | null;
  referralCode: number;
  status: UserStatus;
  type: UserType;
  loginMethods?: any;
  role?: any;
  password?: string;
  twoFaPermissions?: any;
  extraData?: any;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ICreateExperienceAccrualHistoryRequest {
  experienceId: string;
  userId: string;
  amount: number;
  source?: string;
  source_id?: string;
}
