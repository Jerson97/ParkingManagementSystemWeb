export type SubscriptionResponse = {
  readonly id: number;
  readonly customerName: string;
  readonly phoneNumber: string;
  readonly licensePlate: string;
  readonly rateTypeName: string;
  readonly spaceNumber: string;
  readonly status: string;
  readonly startDate: string;
  readonly endDate: string;
};

export type CreateSubscriptionRequest = {
  readonly customerName: string;
  readonly phoneNumber: string;
  readonly licensePlate: string;
  readonly rateTypeId: number;
  readonly parkingSpaceId: number;
  readonly startDate: string;
  readonly endDate: string;
};

export type RenewSubscriptionRequest = {
  readonly subscriptionId: number;
};
