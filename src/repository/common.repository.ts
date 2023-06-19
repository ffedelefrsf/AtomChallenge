import { firestoreInstance } from '../config/firebase';
import { CommonErrorMessages } from '../utils/common-error-messages';
import { CustomError } from '../utils/custom-error';
import { SupportedHttpStatusses } from '../utils/types';

export class CommonRepository<T extends FirebaseFirestore.DocumentData> {
  private readonly collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  constructor(userId: string, collectionName: string) {
    this.collectionRef = firestoreInstance.collection(
      `users/${userId}/${collectionName}`
    );
  }

  findAll(): Promise<T[]> {
    return this.collectionRef
      .get()
      .then((result) => result.docs.map(this.fromDocumentToEntity));
  }

  findById(id: string): Promise<T | undefined> {
    return this.collectionRef
      .doc(id)
      .get()
      .then((documentSnapshot) => {
        const documentData = documentSnapshot.data() as T | undefined;
        if (documentData) {
          return this.fromDocumentToEntity(documentSnapshot);
        }
      });
  }

  async updateById(id: string, newEntity: T): Promise<T> {
    await this.checkExistance(id);
    const enteredEntity = { ...newEntity };
    delete newEntity.id;
    await this.collectionRef.doc(id).update(newEntity);
    return enteredEntity;
  }

  async create(newEntity: T): Promise<T> {
    const { id } = newEntity;
    if (id) {
      const existingElement = await this.checkExistance(id);
      if (existingElement) {
        throw new CustomError(
          SupportedHttpStatusses.BAD_REQUEST,
          CommonErrorMessages.ALREADY_EXISTS
        );
      }
    }
    return this.collectionRef
      .add(newEntity)
      .then((result) => result.get().then(this.fromDocumentToEntity));
  }

  async deleteById(id: string): Promise<T> {
    const existingElement = await this.checkExistance(id);
    this.collectionRef.doc(id).delete();
    return existingElement;
  }

  private checkExistance(id: string) {
    return this.findById(id).then((result) => {
      if (!result) {
        throw new CustomError(
          SupportedHttpStatusses.NOT_FOUND,
          CommonErrorMessages.NOT_FOUND
        );
      } else {
        return result;
      }
    });
  }

  private fromDocumentToEntity(
    documentSnapshot: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ): T {
    return {
      id: documentSnapshot.id,
      ...(documentSnapshot.data() as T)
    };
  }
}
