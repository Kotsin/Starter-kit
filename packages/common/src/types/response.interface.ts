export interface IResponse {
  error?: string;
  message: string;
  status: boolean;
  serviceJwt?: string;
  serviceMeta?: any;
  errorCode?: string;
}
