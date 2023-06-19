import { Request, Response } from 'express';

import { CommonResponseObject, SupportedHttpStatusses } from '../utils/types';
import { CommonController } from '../controller/common.controller';

export const notFoundFallback = (
  _req: Request,
  res: Response<CommonResponseObject>
) => {
  res.status(SupportedHttpStatusses.NOT_FOUND).send({
    ...CommonController.defaultErrorResponse,
    message: 'Route not found.'
  });
};
