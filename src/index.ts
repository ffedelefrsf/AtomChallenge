import express, { Request, Response } from 'express';
import cors from 'cors';

import { getEnvironmentVariable } from './config';
import { CommonResponseObject, SupportedHttpStatusses } from './utils/types';
import TaskController from './controller/task.controller';
import { CommonController } from './controller/common.controller';

export const prefix = '/api';

const app = express();

app.use(express.json());
app.use(cors());

// ROUTERS
const taskController = TaskController.getInstance();
app.use(`${prefix}/${taskController.prefix}`, taskController.router);

// FALLBACK
app.use((_req: Request, res: Response<CommonResponseObject>) => {
  res.status(SupportedHttpStatusses.NOT_FOUND).send({
    ...CommonController.defaultErrorResponse,
    message: 'Route not found.'
  });
});

const port = getEnvironmentVariable('PORT') ?? 3001;

app.listen(port, () => {
  console.log(`Server successfully running on port ${port} !!!`);
});

export default app;
