import { SetMetadata } from '@nestjs/common';

export const CheckPermissions = (checkPermissions: boolean) =>
  SetMetadata('checkPermissions', checkPermissions);
