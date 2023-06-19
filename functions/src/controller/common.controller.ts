import { Response, Router } from 'express';
import { DocumentData } from 'firebase-admin/firestore';

import { CommonResponseObject, SupportedHttpStatusses } from '../utils/types';
import { CustomError } from '../utils/custom-error';

export class CommonController<T extends DocumentData> {
  private readonly routerAPI: Router;

  private readonly path: string;

  static defaultErrorResponse: CommonResponseObject = {
    success: false,
    message: 'An error occurred.',
    extraMessage: ''
  };

  constructor(path: string) {
    this.routerAPI = Router();
    this.path = path;
  }

  get router() {
    return this.routerAPI;
  }

  get prefix() {
    return this.path;
  }

  private readonly responseMapper: {
    [key: string]: (extraMessage?: string) => CommonResponseObject;
  } = {
    [SupportedHttpStatusses.BAD_REQUEST]: (extraMessage = '') => ({
      ...CommonController.defaultErrorResponse,
      message: 'Bad Request.',
      extraMessage
    }),
    [SupportedHttpStatusses.UNAUTHORIZED]: (extraMessage = '') => ({
      ...CommonController.defaultErrorResponse,
      message: 'Unauthorized.',
      extraMessage
    }),
    [SupportedHttpStatusses.FORBIDDEN_RESOURCE]: (extraMessage = '') => ({
      ...CommonController.defaultErrorResponse,
      message: "You don't have permissions to acces this resource.",
      extraMessage
    }),
    [SupportedHttpStatusses.NOT_FOUND]: (extraMessage = '') => ({
      ...CommonController.defaultErrorResponse,
      message: 'Not Found.',
      extraMessage: extraMessage ?? 'Resource not found.'
    }),
    [SupportedHttpStatusses.INTERNAL_SERVER_ERROR]: (extraMessage = '') => ({
      ...CommonController.defaultErrorResponse,
      extraMessage: extraMessage
    })
  };

  getErrorResponseBody(
    httpStatus: any,
    extraMessage?: string
  ): CommonResponseObject {
    return this.responseMapper[httpStatus](extraMessage);
  }

  wrapResult(result: T | T[], extraMessage?: string): CommonResponseObject {
    return {
      success: true,
      data: result,
      extraMessage
    };
  }

  sendErrorResponse(res: Response, error: CustomError): void {
    const status = error.code ?? SupportedHttpStatusses.INTERNAL_SERVER_ERROR;
    res.status(status).send(this.getErrorResponseBody(status, error.message));
  }
}
