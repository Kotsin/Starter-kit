export type EntityResponseTypes<Entity> = Promise<{
  error?: string;
  status: boolean;
  message: string;
  data: Entity[];
}>;

export type EntityResponse<Entity> = Promise<{
  error?: string;
  status: boolean;
  message: string;
  result?: Entity;
}>;

export type DefaultResponse = Promise<{ status: boolean; message: string }>;

export interface IRequest {
  traceId?: string;
  limit?: number;
  page?: number;
}
