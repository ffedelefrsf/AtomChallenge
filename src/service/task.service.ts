import { TaskEntity } from '../model/task/task.entity';

import { CommonService } from './common.service';

export class TaskService extends CommonService<TaskEntity> {
  static collectionName = 'tasks';

  constructor() {
    super(TaskService.collectionName);
  }

  create(entity: TaskEntity) {
    // ADD SOME REQUIRED BUSINESS LOGIC
    return this.repository.create(entity);
  }

  update(entity: TaskEntity) {
    // ADD SOME REQUIRED BUSINESS LOGIC
    return this.repository.updateById(entity.id, entity);
  }

  getAll() {
    // ADD SOME REQUIRED BUSINESS LOGIC
    return this.repository.findAll();
  }

  getById(id: string) {
    // ADD SOME REQUIRED BUSINESS LOGIC
    return this.repository.findById(id);
  }

  delete(id: string) {
    // ADD SOME REQUIRED BUSINESS LOGIC
    return this.repository.deleteById(id);
  }
}
