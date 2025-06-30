import { IRequest, IResponse, UserEntity } from '@crypton-nestjs-kit/common';

export type IUser = Partial<UserEntity>;
// --------------------------------------------------------------
// CREATE USER
// --------------------------------------------------------------

export interface IUserCreateRequest extends IRequest, UserEntity {
  tgId: number;
  username: string;
  firstName?: string;
  lastName?: string;
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
  userId: string;
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
