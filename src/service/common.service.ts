import { CommonRepository } from '../repository/common.repository';

export class CommonService<T extends FirebaseFirestore.DocumentData> {
  readonly repository: CommonRepository<T>;

  constructor(userId: string, collectionName: string) {
    this.repository = new CommonRepository(userId, collectionName);
  }
}
