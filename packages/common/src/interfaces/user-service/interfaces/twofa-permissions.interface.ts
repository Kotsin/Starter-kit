import { LoginMethod } from '../../../entities/user/entry-method.entity';
import { ControllerType } from '../../../utils';
import { IRequest } from '../../entity-response.types';
import { IResponse } from '../../response.interface';

/**
 * Confirmation method information for 2FA permissions
 */
export interface IConfirmationMethod {
  /** Unique identifier of the confirmation method */
  readonly id: string;
  /** Type of confirmation method (email, phone, google, etc.) */
  readonly method: LoginMethod;
}

/**
 * Two-factor authentication permission information
 */
export interface ITwoFaPermission {
  /** Unique identifier of the permission */
  readonly id: string;
  /** HTTP method (GET, POST, PUT, DELETE) */
  readonly method: string;
  /** Human-readable alias for the permission */
  readonly alias: string;
  /** Detailed description of the permission */
  readonly description: string;
  /** Controller type (READ, WRITE, etc.) */
  readonly type: ControllerType;
  /** Available confirmation methods for this permission */
  readonly confirmationMethods: IConfirmationMethod[];
}

/**
 * Request for getting user's 2FA permissions list
 */
export interface IGetTwoFaPermissionsRequest extends IRequest {
  /** User ID to get 2FA permissions for */
  readonly userId: string;
}

/**
 * Meta information for 2FA permissions
 */
export interface ITwoFaPermissionsMeta {
  total: number;
  page: number;
  limit: number;
}

/**
 * Response containing user's 2FA permissions list
 */
export interface IGetTwoFaPermissionsResponse extends IResponse {
  /** Array of 2FA permissions with their confirmation methods */
  readonly twoFaPermissions: ITwoFaPermission[];
  /** Meta information for the response */
  readonly meta: ITwoFaPermissionsMeta;
}

/**
 * Request for checking if user has 2FA permission for a specific messagePattern
 */
export interface ICheckTwoFaPermissionRequest extends IRequest {
  userId: string;
  permissionId: string;
}

/**
 * Response for checking if user has 2FA permission for a specific messagePattern
 */
export interface ICheckTwoFaPermissionResponse extends IResponse {
  needConfirmation: boolean;
}
