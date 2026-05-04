export type LoginRequest = {
  readonly username: string;
  readonly password: string;
};

export type LoginResponse = {
  readonly userId: number;
  readonly fullName: string;
  readonly username: string;
  readonly role: string;
  readonly token: string;
};

export type CurrentUser = Omit<LoginResponse, 'token'>;
