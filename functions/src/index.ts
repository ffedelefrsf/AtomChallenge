import express from 'express';
import cors from 'cors';
import { onRequest } from 'firebase-functions/v2/https';

import TaskController from './controller/task.controller';
import { AuthGuard } from './middlewares/auth.guard';
import { SupportedHttpStatusses } from './utils/types';
import { CommonController } from './controller/common.controller';
// import { getEnvironmentVariable } from './config';

export const prefix = '/api';

const app = express();

app.use(express.json());
app.use(cors());

app.use(AuthGuard.getInstance().setupMiddleware);

// ROUTERS
const taskController = TaskController.getInstance();
app.use(`${prefix}/${taskController.prefix}`, taskController.router);

// FALLBACK
app.use((_req, res: any) => {
  res.status(SupportedHttpStatusses.NOT_FOUND).send({
    ...CommonController.defaultErrorResponse,
    message: 'Route not found.'
  });
});

// const port = getEnvironmentVariable('PORT') ?? 3001;

// app.listen(port, () => {
//   console.log(`Server successfully running on port ${port} !!!`);
// });

export default app;

exports.app = onRequest(app);
