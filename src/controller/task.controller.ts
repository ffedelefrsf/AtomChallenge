import { NextFunction, Request, Response } from 'express';

import { TaskService } from '../service/task.service';
import { CommonController } from './common.controller';
import { SupportedHttpStatusses } from '../utils/types';
import { TaskEntity } from '../model/task/task.entity';
import { TaskStatus } from '../model/task/task-status.enum';

export class TaskController extends CommonController<TaskEntity, TaskService> {
  constructor() {
    super(new TaskService(), 'tasks');
    this.initializeRouter();
  }

  initializeRouter() {
    // GET ALL
    this.router.get('', (_req, res) => {
      this.service
        .getAll()
        .then((result) => {
          const status =
            result.length > 0
              ? SupportedHttpStatusses.OK
              : SupportedHttpStatusses.NO_CONTENT;
          res.status(status).send(this.wrapResult(result));
        })
        .catch((error) => this.sendErrorResponse(res, error));
    });

    // CREATE NEW ONE
    this.router.post('', this.validateBodyInput.bind(this), (req, res) => {
      const { body }: { body: TaskEntity } = req;
      this.service
        .create(body)
        .then((result) => {
          res
            .status(SupportedHttpStatusses.CREATED)
            .send(this.wrapResult(result));
        })
        .catch((error) => this.sendErrorResponse(res, error));
    });

    // UPDATE BY ID
    this.router.put(
      '/:id',
      this.validateIdInput.bind(this),
      this.validateBodyInput.bind(this),
      (req, res) => {
        const {
          body,
          params: { id }
        } = req;
        this.service
          .update({ id, ...body })
          .then((result) => {
            res.status(SupportedHttpStatusses.OK).send(this.wrapResult(result));
          })
          .catch((error) => this.sendErrorResponse(res, error));
      }
    );

    // DELETE BY ID
    this.router.delete('/:id', this.validateIdInput.bind(this), (req, res) => {
      const {
        params: { id }
      } = req;
      this.service
        .delete(id)
        .then((result) => {
          res.status(SupportedHttpStatusses.OK).send(this.wrapResult(result));
        })
        .catch((error) => this.sendErrorResponse(res, error));
    });
  }

  private validateIdInput(req: Request, res: Response, next: NextFunction) {
    const {
      params: { id }
    } = req;

    const status = SupportedHttpStatusses.BAD_REQUEST;

    if (id === '' || id === undefined) {
      res
        .status(status)
        .send(this.getErrorResponseBody(status, 'Missing id param.'));
    } else {
      next();
    }
  }

  private validateBodyInput(req: Request, res: Response, next: NextFunction) {
    const { body } = req;

    const status = SupportedHttpStatusses.BAD_REQUEST;

    let errorMessage: string | undefined;
    try {
      if (typeof body !== 'object' || Object.keys(body).length === 0) {
        errorMessage = 'Empty body.';
      } else {
        // TYPE CHECK
        for (const entry of Object.entries(body)) {
          const [key, value] = entry;
          if (value !== undefined && typeof value !== 'string') {
            errorMessage = `${key} needs to be a string.`;
            break;
          }
        }
        if (!errorMessage) {
          let {
            id,
            description,
            status,
            title
          }: {
            id: string;
            description: string;
            status: string;
            title: string;
          } = body;

          // SANITIZE INPUTS
          id = id?.trim();
          description = description?.trim();
          status = status?.trim();
          title = title?.trim();

          // ASSUMING TITLE IS ALWAYS REQUIRED, CANNOT CONTAIN SPECIAL CHARACTERS AND IS BETWEEN 5 / 100 LENGTH
          if (!title) {
            errorMessage = 'Title is required.';
          } else {
            const hasSpecialChars = title.match(/[^a-z0-9]/gi);
            if (hasSpecialChars && hasSpecialChars.length > 0) {
              errorMessage = 'Title must only have letters and/or numbers.';
            } else if (title.length < 5 || title.length > 100) {
              errorMessage =
                'Title must be more than 5 and less than 100 characters long.';
            } else if (
              status !== undefined &&
              !Object.keys(TaskStatus).includes(status)
            ) {
              // CHECK STATUS
              errorMessage = `Status could be one of the set: [${Object.keys(
                TaskStatus
              ).join(', ')}]`;
            }
          }
        }
      }
    } catch (error) {
      const sampleInput: Omit<TaskEntity, 'status'> & { status: string } = {
        id: 'SOME_COOL_HASH_ID',
        description: 'This is a task description',
        status: `Status could be one of the set: [${Object.keys(
          TaskStatus
        ).join(', ')}]`,
        title: 'This is a task title'
      };
      errorMessage = `Body needs to be an object of the type: ${JSON.stringify(
        sampleInput
      )}`;
    }
    if (errorMessage) {
      res.status(status).send(this.getErrorResponseBody(status, errorMessage));
    } else {
      next();
    }
  }
}

export default TaskController;
