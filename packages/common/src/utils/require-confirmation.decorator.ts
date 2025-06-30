import { SetMetadata } from '@nestjs/common';

export const PERMISSION_ID = 'permissionId';
export const Permission = (permissionId: string) =>
  SetMetadata(PERMISSION_ID, permissionId);
