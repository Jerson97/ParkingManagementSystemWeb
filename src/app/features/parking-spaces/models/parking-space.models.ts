export interface ParkingSpaceResponse {
  readonly id: number;
  readonly spaceNumber: string;
  readonly status: string;
  readonly licensePlate: string | null;
  readonly customerName: string | null;
}
