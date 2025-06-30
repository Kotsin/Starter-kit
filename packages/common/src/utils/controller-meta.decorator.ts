import { SetMetadata } from '@nestjs/common';

export const CONTROLLER_META = 'controllerMeta';

export interface ControllerMetaOptions {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export function ControllerMeta(options: ControllerMetaOptions) {
  return SetMetadata(CONTROLLER_META, options);
}
