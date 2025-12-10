export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const asyncHandler = (fn: Function) => {
  return (...args: any[]) => Promise.resolve(fn(...args)).catch(args[2]);
};
