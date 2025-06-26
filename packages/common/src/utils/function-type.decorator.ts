import { SetMetadata } from '@nestjs/common';

export const FUNCTION_TYPE = 'functionType';
export const FunctionType = (functionType: 'READ' | 'WRITE') =>
  SetMetadata(FUNCTION_TYPE, functionType);
