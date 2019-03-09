import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Auth} from 'app/service/auth';
import {Config} from 'app/service/config';
import {takeUntil} from 'rxjs/operators';

import {ActivatedRepository} from '../activated-repository';

import {IdentifiedObject, ListDao} from './list-dao';

@Injectable()
export class RepositoryCollectionDao<T extends IdentifiedObject> extends ListDao<T> {
  constructor(
      auth: Auth, activatedRepository: ActivatedRepository, config: Config, subPath: string) {
    super(auth, config, subPath);

    activatedRepository.repository.pipe(takeUntil(this.destroyed)).subscribe(repository => {
      if (repository) {
        this.path = repository;
      }
    });
  }
}
