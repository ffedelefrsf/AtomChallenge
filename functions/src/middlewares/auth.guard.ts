import { NextFunction, Request, Response } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

import { CommonResponseObject, SupportedHttpStatusses } from '../utils/types';
import { CommonController } from '../controller/common.controller';
import { firebaseAuth } from '../config/firebase';
import { CommonRequest } from '../controller/task.controller';

export class AuthGuard {
  private static instance: AuthGuard;

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new AuthGuard();
    }
    return this.instance;
  }

  async setupMiddleware(
    req: Request,
    res: Response<CommonResponseObject>,
    next: NextFunction
  ) {
    try {
      const authorization = req.headers.authorization as string;
      const token = authorization.replace('Bearer ', '');
      const decodedToken: DecodedIdToken = await firebaseAuth.verifyIdToken(
        token
      );
      (req as CommonRequest<any, any>).user = decodedToken;
      next();
    } catch (error) {
      res.status(SupportedHttpStatusses.UNAUTHORIZED).send({
        ...CommonController.defaultErrorResponse,
        message: 'Unauthorized.'
      });
    }
  }
}
