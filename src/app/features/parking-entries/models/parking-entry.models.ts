export interface CreateParkingEntryRequest {
  readonly licensePlate: string;
  readonly rateTypeId: number;
}

export interface CreateParkingEntryResponse {
  readonly parkingEntryId: number;
  readonly ticketNumber: string;
  readonly licensePlate: string;
  readonly rateTypeName: string;
  readonly rateTypePrice: number;
  readonly isHourly: boolean;
  readonly entryTime: string;
  readonly spaceNumber: string;
  readonly paymentStatus: string;
  readonly status: string;
}

export interface GetParkingFeeRequest {
  readonly ticketNumber: string;
}

export interface GetParkingFeeResponse {
  readonly ticketNumber: string;
  readonly licensePlate: string;
  readonly rateTypeName: string;
  readonly entryTime: string;
  readonly currentTime: string;
  readonly estimatedAmount: number;
  readonly spaceNumber: string;
}

export interface RegisterVehicleExitRequest {
  readonly ticketNumber: string;
}

export interface RegisterVehicleExitResponse {
  readonly parkingEntryId: number;
  readonly ticketNumber: string;
  readonly licensePlate: string;
  readonly rateTypeName: string;
  readonly entryTime: string;
  readonly exitTime: string;
  readonly totalAmount: number;
  readonly paymentStatus: string;
  readonly status: string;
  readonly spaceNumber: string;
}

export interface GetParkingEntryByTicketResponse {
  readonly id: number;
  readonly ticketNumber: string;
  readonly licensePlate: string;
  readonly spaceNumber: string;
  readonly rateTypeName: string;
  readonly entryTime: string;
  readonly exitTime: string | null;
  readonly totalAmount: number | null;
  readonly status: string;
  readonly paymentStatus: string;
}

export interface GetParkingEntryHistoryFilters {
  readonly licensePlate?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface GetParkingEntryHistoryResponse {
  readonly id: number;
  readonly ticketNumber: string;
  readonly licensePlate: string;
  readonly spaceNumber: string;
  readonly rateTypeName: string;
  readonly entryTime: string;
  readonly exitTime: string | null;
  readonly totalAmount: number | null;
  readonly paymentStatus: string;
  readonly status: string;
}
