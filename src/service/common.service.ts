import { CommonRepository } from '../repository/common.repository';

export class CommonService<T extends FirebaseFirestore.DocumentData> {
  readonly repository: CommonRepository<T>;

  constructor(collectionName: string) {
    this.repository = new CommonRepository(collectionName);
  }
}
