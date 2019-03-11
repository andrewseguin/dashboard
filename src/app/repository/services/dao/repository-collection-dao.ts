import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {RepoIndexedDb, StoreId} from '../repo-indexed-db';
import {IdentifiedObject, ListDao} from './list-dao';


@Injectable()
export class RepositoryCollectionDao<T extends IdentifiedObject> extends ListDao<T> {
  constructor(auth: Auth, repoIndexedDb: RepoIndexedDb, collectionId: StoreId) {
    super(auth, repoIndexedDb, collectionId);
  }
}
