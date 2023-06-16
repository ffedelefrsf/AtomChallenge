import { NextFunction, Request, Response } from 'express';

import { TaskService } from '../service/task.service';
import { CommonController } from './common.controller';
import { CommonResponseObject, SupportedHttpStatusses } from '../utils/types';
import { TaskEntity } from '../model/task/task.entity';
import { TaskStatus } from '../model/task/task-status.enum';
import { ErrorMessages } from '../model/task/error-messages.enum';
import { CustomError } from '../utils/custom-error';

export class TaskController extends CommonController<TaskEntity, TaskService> {
  private static instance: TaskController;

  private sampleInputType: Omit<TaskEntity, 'status'> & { status: string } = {
    id: 'SOME_COOL_HASH_ID',
    description: 'This is a task description',
    status: `Status could be one of the set: [${Object.keys(TaskStatus).join(
      ', '
    )}]`,
    title: 'This is a task title'
  };

  // ASSUMING EMPTY DESCRIPTION AND PENDING STATUS AS INITIAL VALUES
  private readonly newEntityInitialValues: Omit<TaskEntity, 'id' | 'title'> = {
    description: '',
    status: TaskStatus.PENDING
  };

  private constructor() {
    super(new TaskService(), 'tasks');
    this.initializeRouter();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new TaskController();
    }
    return this.instance;
  }

  get sampleInput() {
    return this.sampleInputType;
  }

  initializeRouter() {
    // GET ALL
    this.router.get(
      '',
      (_req: Request, res: Response<CommonResponseObject>) => {
        this.service
          .getAll()
          .then((result) => {
            const status =
              result.length > 0
                ? SupportedHttpStatusses.OK
                : SupportedHttpStatusses.NO_CONTENT;
            res.status(status).send(this.wrapResult(result));
          })
          .catch((error: CustomError) => this.sendErrorResponse(res, error));
      }
    );

    // CREATE NEW ONE
    this.router.post(
      '',
      this.validateBodyInput.bind(this),
      (req: Request, res: Response<CommonResponseObject>) => {
        const { body }: { body: TaskEntity } = req;
        const entityToCreate = {
          ...this.newEntityInitialValues,
          ...body
        };
        this.service
          .create(entityToCreate)
          .then((result) => {
            res
              .status(SupportedHttpStatusses.CREATED)
              .send(this.wrapResult(result));
          })
          .catch((error: CustomError) => this.sendErrorResponse(res, error));
      }
    );

    // UPDATE BY ID
    this.router.put(
      '/:id',
      this.validateIdInput.bind(this),
      this.validateBodyInput.bind(this),
      (req: Request, res: Response<CommonResponseObject>) => {
        const {
          body,
          params: { id }
        } = req;
        this.service
          .update({ id, ...body })
          .then((result) => {
            res.status(SupportedHttpStatusses.OK).send(this.wrapResult(result));
          })
          .catch((error: CustomError) => this.sendErrorResponse(res, error));
      }
    );

    // DELETE BY ID
    this.router.delete(
      '/:id',
      this.validateIdInput.bind(this),
      (req: Request, res: Response<CommonResponseObject>) => {
        const {
          params: { id }
        } = req;
        this.service
          .delete(id)
          .then((result) => {
            res.status(SupportedHttpStatusses.OK).send(this.wrapResult(result));
          })
          .catch((error: CustomError) => this.sendErrorResponse(res, error));
      }
    );
  }

  private validateIdInput(
    req: Request,
    res: Response<CommonResponseObject>,
    next: NextFunction
  ) {
    let {
      params: { id }
    } = req;

    const status = SupportedHttpStatusses.BAD_REQUEST;

    // SANITIZE INPUTS
    id = id?.trim();

    if (id === '' || id === undefined) {
      res
        .status(status)
        .send(this.getErrorResponseBody(status, 'Missing id param.'));
    } else {
      next();
    }
  }

  private validateBodyInput(
    req: Request,
    res: Response<CommonResponseObject>,
    next: NextFunction
  ) {
    const { body } = req;

    const status = SupportedHttpStatusses.BAD_REQUEST;

    let errorMessage: string | undefined;
    try {
      if (typeof body !== 'object' || Object.keys(body).length === 0) {
        errorMessage = ErrorMessages.EMPTY_BODY;
      } else {
        // TYPE CHECK
        for (const entry of Object.entries(body)) {
          const [key, value] = entry;
          if (value !== undefined && typeof value !== 'string') {
            errorMessage = `${ErrorMessages.TYPE_MISMATCH.replace(
              '{key}',
              key
            )}`;
            break;
          }
        }
        if (!errorMessage) {
          let {
            id,
            description,
            status,
            title,
            ...extraFields
          }: {
            id: string;
            description: string;
            status: string;
            title: string;
            extraFields: any[];
          } = body;
          if (Object.keys(extraFields).length > 0) {
            errorMessage = `${ErrorMessages.FALLBACK_ERROR.replace(
              '{sampleInput}',
              JSON.stringify(this.sampleInput, null, 2)
            )}`;
          } else {
            // SANITIZE INPUTS
            id = id?.trim();
            description = description?.trim();
            status = status?.trim();
            title = title?.trim();

            // ASSUMING TITLE IS ALWAYS REQUIRED, CANNOT CONTAIN SPECIAL CHARACTERS AND IS BETWEEN 5 / 100 LENGTH
            if (!title) {
              errorMessage = ErrorMessages.REQUIRED_TITLE;
            } else {
              const hasSpecialChars = title.match(/[^a-z 0-9]/gi);
              if (hasSpecialChars && hasSpecialChars.length > 0) {
                errorMessage = ErrorMessages.TITLE_FORMAT;
              } else if (title.length < 5 || title.length > 100) {
                errorMessage = ErrorMessages.TITLE_LENGTH;
              } else if (
                status !== undefined &&
                !Object.values(TaskStatus).includes(status as TaskStatus)
              ) {
                // CHECK STATUS
                errorMessage = `${ErrorMessages.STATUS_ENUM.replace(
                  '{statusses}',
                  `[${Object.values(TaskStatus).join(', ')}]`
                )}`;
              }
            }
          }
        }
      }
    } catch (error) {
      errorMessage = `${ErrorMessages.FALLBACK_ERROR.replace(
        '{sampleInput}',
        JSON.stringify(this.sampleInput, null, 2)
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
