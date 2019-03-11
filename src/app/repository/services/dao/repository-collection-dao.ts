import {Injectable} from '@angular/core';
import {RepoIndexedDb, StoreId} from '../repo-indexed-db';
import {IdentifiedObject, ListDao} from './list-dao';

@Injectable()
export class RepositoryCollectionDao<T extends IdentifiedObject> extends ListDao<T> {
  constructor(repoIndexedDb: RepoIndexedDb, collectionId: StoreId) {
    super(repoIndexedDb, collectionId);
  }
}
