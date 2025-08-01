import { DefaultRole, UserStatus } from '../../../enums';

export interface User {
  id: string;
  fullName: string | null;
  username: string | null;
  referralCode: number;
  status: UserStatus;
  type: DefaultRole;
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
