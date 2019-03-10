import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {RepoDataStore, StoreId} from '../repo-data-store';
import {IdentifiedObject, ListDao} from './list-dao';


@Injectable()
export class RepositoryCollectionDao<T extends IdentifiedObject> extends ListDao<T> {
  constructor(auth: Auth, repoDataStore: RepoDataStore, collectionId: StoreId) {
    super(auth, repoDataStore, collectionId);
  }
}
