import { HttpStatus } from "./httpsStatusCode.utils";

export class HttpError extends Error {
  public statusCode: HttpStatus;

  constructor(message: string, statusCode: HttpStatus ) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}