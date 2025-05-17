import { SetMetadata } from '@nestjs/common';

export const REQUIRE_CONFIRMATION_KEY = 'requireConfirmation';
export const RequireConfirmation = (permissionId: string) =>
  SetMetadata(REQUIRE_CONFIRMATION_KEY, permissionId);
