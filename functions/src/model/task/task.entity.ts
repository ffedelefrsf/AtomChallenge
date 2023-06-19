import { TaskStatus } from './task-status.enum';

export interface TaskEntity {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
}
