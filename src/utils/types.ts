export interface CommonResponseObject {
  success: boolean;
  data: any;
  message?: string;
  extraMessage?: string;
}

export enum SupportedHttpStatusses {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN_RESOURCE = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}
