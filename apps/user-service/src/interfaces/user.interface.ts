import { IRequest, IResponse, UserEntity } from '@merchant-outline/common';

export type IUser = Partial<UserEntity>;
// --------------------------------------------------------------
// CREATE USER
// --------------------------------------------------------------

export interface IUserCreateRequest extends IRequest, UserEntity {
  tg_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface IUserCreateResponse extends IResponse {
  user: IUser | null;
  created?: boolean;
}

// --------------------------------------------------------------
// GET BY LOGIN
// --------------------------------------------------------------
export type IUserGetByLoginRequest = Omit<
  IUserCreateRequest,
  'password' | 'type'
>;
export interface IUserGetByLoginResponse
  extends Omit<IUserCreateResponse, 'code' | 'user'> {
  user: UserEntity | null;
}

// --------------------------------------------------------------
// GET BY ID
// --------------------------------------------------------------
export interface IUserGetByIdRequest extends IRequest {
  user_id: string;
}

type UserWithReferralName = UserEntity & { referralUsername: string | null };
export interface IUserGetByIdResponse
  extends Omit<IUserCreateResponse, 'code' | 'user'> {
  user: UserWithReferralName | null;
}

export interface INotifyInactiveUsersRequest extends IRequest {
  readonly id?: string;
  readonly url: string;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly message: {
    readonly en: string;
    readonly ru: string;
  };
}

export interface IUserUpdateMetadataRequest extends IRequest {
  readonly user_id: string;
  readonly last_login_at?: Date;
  readonly is_notify?: boolean;
  readonly is_bot_blocked?: boolean;
  readonly lang?: string;
  readonly extra_data?: any;
}
