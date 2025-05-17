import { UserStatus, UserType } from '../../../enums';

export interface User {
  id: string;
  full_name: string | null;
  username: string | null;
  referral_code: number;
  status: UserStatus;
  type: UserType;
  loginMethods?: any;
  role?: any;
  twoFaPermissions?: any;
  extra_data?: any;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ICreateExperienceAccrualHistoryRequest {
  experienceId: string;
  userId: string;
  amount: number;
  source?: string;
  source_id?: string;
}
