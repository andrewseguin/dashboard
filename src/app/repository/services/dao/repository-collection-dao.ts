import {Injectable} from '@angular/core';
import {Auth} from 'app/service/auth';
import {CollectionId, RepoDao} from '../repo-dao';
import {IdentifiedObject, ListDao} from './list-dao';


@Injectable()
export class RepositoryCollectionDao<T extends IdentifiedObject> extends ListDao<T> {
  constructor(auth: Auth, repoDao: RepoDao, collectionId: CollectionId) {
    super(auth, repoDao, collectionId);
  }
}
