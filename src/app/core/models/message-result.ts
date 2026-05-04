export type MessageResult<T> = {
  readonly code: number;
  readonly message: string;
  readonly data: T | null;
};
