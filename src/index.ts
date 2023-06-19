import express from 'express';
import cors from 'cors';

import { getEnvironmentVariable } from './config';
import TaskController from './controller/task.controller';
import { AuthGuard } from './middlewares/auth.guard';
import { notFoundFallback } from './middlewares/not-found-fallback';

export const prefix = '/api';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: getEnvironmentVariable('FRONTEND_BASE_URL')
  })
);

app.use(AuthGuard.getInstance().setupMiddleware);

// ROUTERS
const taskController = TaskController.getInstance();
app.use(`${prefix}/${taskController.prefix}`, taskController.router);

// FALLBACK
app.use(notFoundFallback);

const port = getEnvironmentVariable('PORT') ?? 3001;

app.listen(port, () => {
  console.log(`Server successfully running on port ${port} !!!`);
});

export default app;
