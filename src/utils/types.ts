import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { DocumentData } from 'firebase-admin/firestore';

import { CommonService } from '../service/common.service';

export interface CommonResponseObject {
  success: boolean;
  data?: any;
  message?: string;
  extraMessage?: string;
}

export interface CommonRequest<
  T extends DocumentData,
  TService extends CommonService<T>
> extends Request {
  user: DecodedIdToken;
  service: TService;
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
