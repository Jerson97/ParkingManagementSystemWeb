export interface RateTypeResponse {
  readonly id: number;
  readonly name: string;
  readonly price: number;
  readonly isHourly: boolean;
  readonly isActive: boolean;
}

export interface CreateRateTypeRequest {
  readonly name: string;
  readonly price: number;
  readonly isHourly: boolean;
}

export interface UpdateRateTypeRequest {
  readonly name: string;
  readonly price: number;
  readonly isHourly: boolean;
}
