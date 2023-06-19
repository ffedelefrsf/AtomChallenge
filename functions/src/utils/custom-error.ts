export class CustomError extends Error {
  private readonly errorCode: number;
  constructor(code: number, message: string) {
    super(message);
    this.errorCode = code;
  }

  get code() {
    return this.errorCode;
  }
}
