export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ServiceType {
  NOTIFICATION = 'notification',
}

export interface Service {
  readonly id: string;
  readonly url: string;
  readonly type: ServiceType;
  readonly load: number;
  readonly status: ServiceStatus;
  readonly last_updated: Date;
  readonly created_at: Date;
}
