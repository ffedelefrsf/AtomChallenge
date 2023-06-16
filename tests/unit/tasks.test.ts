import { Application } from 'express';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

import server, { prefix } from '../../src';
import { TaskEntity } from '../../src/model/task/task.entity';
import { TaskStatus } from '../../src/model/task/task-status.enum';
import TaskController from '../../src/controller/task.controller';
import {
  CommonResponseObject,
  SupportedHttpStatusses
} from '../../src/utils/types';
import { TaskRepository } from '../../src/repository/task.repository';
import { CommonErrorMessages } from '../../src/utils/common-error-messages';
import { ErrorMessages } from '../../src/model/task/error-messages.enum';

chai.use(chaiHttp);

const sandbox = sinon.createSandbox();

const mockedTask1: TaskEntity = {
  id: '63c64f2a-0c82-4be1-979c-4c864400e186',
  title: 'asdasd',
  description: 'asdasd',
  status: TaskStatus.COMPLETED
};

const mockedTask2: TaskEntity = {
  id: '22331123123',
  title: 'Some other title',
  description: 'Some other description',
  status: TaskStatus.PENDING
};

const mockedTasks: TaskEntity[] = [mockedTask1, mockedTask2];

describe('Tasks API Unit Tests', () => {
  let syncServer: Application;
  let controller: TaskController;
  let repository: TaskRepository;

  before(async () => {
    syncServer = await server;
    controller = TaskController.getInstance();
    repository = controller.service.repository;
  });

  afterEach(() => {
    sandbox.restore();
  });

  // GET All Tasks
  describe('Get all tasks', () => {
    it('should retrieve all the tasks in firestore', async () => {
      sandbox.stub(repository, 'findAll').resolves(mockedTasks);
      const response = await chai
        .request(syncServer)
        .get(`${prefix}/${controller.prefix}`);
      expect(response).to.have.status(SupportedHttpStatusses.OK);
      const expectedResponseBody: CommonResponseObject = {
        success: true,
        data: mockedTasks
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve no tasks', async () => {
      sandbox.stub(repository, 'findAll').resolves([]);
      const response = await chai
        .request(syncServer)
        .get(`${prefix}/${controller.prefix}`);
      expect(response).to.have.status(SupportedHttpStatusses.NO_CONTENT);
      expect(response.body).to.deep.equal({});
    });
  });

  // Create Task
  describe('Create new task', () => {
    it('should create successfully', async () => {
      sandbox.stub(repository, 'findById').resolves(undefined);
      sandbox.stub(repository, 'create').resolves(mockedTask1);
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(mockedTask1);
      expect(response).to.have.status(SupportedHttpStatusses.CREATED);
      const expectedResponseBody: CommonResponseObject = {
        success: true,
        data: mockedTask1
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should add default values', async () => {
      sandbox.stub(repository, 'findById').resolves(undefined);
      const auxEntity: Omit<TaskEntity, 'id' | 'description' | 'status'> = {
        title: 'asdasd'
      };
      const entityThatShouldBeCreated: TaskEntity = {
        ...auxEntity,
        id: 'someRanD',
        description: '',
        status: TaskStatus.PENDING
      };
      sandbox.stub(repository, 'create').resolves(entityThatShouldBeCreated);
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(auxEntity);
      expect(response).to.have.status(SupportedHttpStatusses.CREATED);
      const expectedResponseBody: CommonResponseObject = {
        success: true,
        data: entityThatShouldBeCreated
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should find task and retrieve error', async () => {
      sandbox.stub(repository, 'findById').resolves(mockedTask1);
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(mockedTask1);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: CommonErrorMessages.ALREADY_EXISTS
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should handle service failure', async () => {
      sandbox.stub(repository, 'findById').throwsException(new Error('asd'));
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(mockedTask1);
      const responseStatus = SupportedHttpStatusses.INTERNAL_SERVER_ERROR;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: 'asd'
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve empty body error', async () => {
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send({});
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.EMPTY_BODY
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve required title error', async () => {
      const auxMockedTask = { ...mockedTask1, title: undefined };
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.REQUIRED_TITLE
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve wrong title error', async () => {
      const auxMockedTask = { ...mockedTask1, title: '%%%%%' };
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.TITLE_FORMAT
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve title length error', async () => {
      const auxMockedTask = { ...mockedTask1, title: 'titl' };
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.TITLE_LENGTH
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve title length error', async () => {
      const longTitle =
        'title title title title title title title title title title title title title title title title title'; // 101 length
      const auxMockedTask = { ...mockedTask1, title: longTitle };
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.TITLE_LENGTH
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve extra fields error', async () => {
      const response = await chai
        .request(syncServer)
        .post(`${prefix}/${controller.prefix}`)
        .send({ ...mockedTask1, sthElse: 'true' });
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.FALLBACK_ERROR.replace(
          '{sampleInput}',
          JSON.stringify(controller.sampleInput, null, 2)
        )
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    describe('Type mismatch errors', () => {
      it('title mismatch error', async () => {
        const keyName = 'title';
        const auxMockedTask = { ...mockedTask1, [keyName]: 123 };
        const response = await chai
          .request(syncServer)
          .post(`${prefix}/${controller.prefix}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });

      it('description mismatch error', async () => {
        const keyName = 'description';
        const auxMockedTask = { ...mockedTask1, [keyName]: true };
        const response = await chai
          .request(syncServer)
          .post(`${prefix}/${controller.prefix}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });

      it('status mismatch error', async () => {
        const keyName = 'status';
        const auxMockedTask = { ...mockedTask1, [keyName]: 123 };
        const response = await chai
          .request(syncServer)
          .post(`${prefix}/${controller.prefix}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });

      it('id mismatch error', async () => {
        const keyName = 'id';
        const auxMockedTask = { ...mockedTask1, [keyName]: {} };
        const response = await chai
          .request(syncServer)
          .post(`${prefix}/${controller.prefix}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });
    });
  });

  // Update By Id Tasks
  describe('Update task by id', () => {
    it('should update successfully', async () => {
      sandbox.stub(repository, 'findById').resolves(mockedTask1);
      sandbox.stub(repository, 'updateById').resolves(mockedTask2);
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(mockedTask2);
      expect(response).to.have.status(SupportedHttpStatusses.OK);
      const expectedResponseBody: CommonResponseObject = {
        success: true,
        data: mockedTask2
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should not find task', async () => {
      sandbox.stub(repository, 'findById').resolves(undefined);
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(mockedTask2);
      const responseStatus = SupportedHttpStatusses.NOT_FOUND;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: CommonErrorMessages.NOT_FOUND
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should handle service failure', async () => {
      sandbox.stub(repository, 'findById').throwsException(new Error());
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(mockedTask2);
      const responseStatus = SupportedHttpStatusses.INTERNAL_SERVER_ERROR;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus)
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve empty body error', async () => {
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send({});
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.EMPTY_BODY
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve required title error', async () => {
      const auxMockedTask = { ...mockedTask1, title: undefined };
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.REQUIRED_TITLE
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve wrong title error', async () => {
      const auxMockedTask = { ...mockedTask1, title: '%%%%%' };
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.TITLE_FORMAT
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve title length error', async () => {
      const auxMockedTask = { ...mockedTask1, title: 'titl' };
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.TITLE_LENGTH
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve title length error', async () => {
      const longTitle =
        'title title title title title title title title title title title title title title title title title'; // 101 length
      const auxMockedTask = { ...mockedTask1, title: longTitle };
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send(auxMockedTask);
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.TITLE_LENGTH
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should retrieve extra fields error', async () => {
      const response = await chai
        .request(syncServer)
        .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
        .send({ ...mockedTask1, sthElse: 'true' });
      const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: ErrorMessages.FALLBACK_ERROR.replace(
          '{sampleInput}',
          JSON.stringify(controller.sampleInput, null, 2)
        )
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    describe('Type mismatch errors', () => {
      it('title mismatch error', async () => {
        const keyName = 'title';
        const auxMockedTask = { ...mockedTask1, [keyName]: 123 };
        const response = await chai
          .request(syncServer)
          .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });

      it('description mismatch error', async () => {
        const keyName = 'description';
        const auxMockedTask = { ...mockedTask1, [keyName]: true };
        const response = await chai
          .request(syncServer)
          .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });

      it('status mismatch error', async () => {
        const keyName = 'status';
        const auxMockedTask = { ...mockedTask1, [keyName]: 123 };
        const response = await chai
          .request(syncServer)
          .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });

      it('id mismatch error', async () => {
        const keyName = 'id';
        const auxMockedTask = { ...mockedTask1, [keyName]: {} };
        const response = await chai
          .request(syncServer)
          .put(`${prefix}/${controller.prefix}/${mockedTask1.id}`)
          .send(auxMockedTask);
        const responseStatus = SupportedHttpStatusses.BAD_REQUEST;
        expect(response).to.have.status(responseStatus);
        const expectedResponseBody: CommonResponseObject = {
          ...controller.getErrorResponseBody(responseStatus),
          extraMessage: ErrorMessages.TYPE_MISMATCH.replace('{key}', keyName)
        };
        expect(response.body).to.deep.equal(expectedResponseBody);
      });
    });
  });

  // Delete By Id Tasks
  describe('Delete task by id', () => {
    it('should delete successfully', async () => {
      sandbox.stub(repository, 'findById').resolves(mockedTask1);
      sandbox.stub(repository, 'deleteById').resolves(mockedTask2);
      const response = await chai
        .request(syncServer)
        .delete(`${prefix}/${controller.prefix}/${mockedTask1.id}`);
      expect(response).to.have.status(SupportedHttpStatusses.OK);
      const expectedResponseBody: CommonResponseObject = {
        success: true,
        data: mockedTask2
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should not find task', async () => {
      sandbox.stub(repository, 'findById').resolves(undefined);
      const response = await chai
        .request(syncServer)
        .delete(`${prefix}/${controller.prefix}/${mockedTask1.id}`);
      const responseStatus = SupportedHttpStatusses.NOT_FOUND;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus),
        extraMessage: CommonErrorMessages.NOT_FOUND
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });

    it('should handle service failure', async () => {
      sandbox.stub(repository, 'findById').throwsException(new Error());
      const response = await chai
        .request(syncServer)
        .delete(`${prefix}/${controller.prefix}/${mockedTask1.id}`);
      const responseStatus = SupportedHttpStatusses.INTERNAL_SERVER_ERROR;
      expect(response).to.have.status(responseStatus);
      const expectedResponseBody: CommonResponseObject = {
        ...controller.getErrorResponseBody(responseStatus)
      };
      expect(response.body).to.deep.equal(expectedResponseBody);
    });
  });
});
