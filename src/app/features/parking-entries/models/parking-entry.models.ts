export interface CreateParkingEntryRequest {
  readonly licensePlate: string;
  readonly rateTypeId: number;
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
