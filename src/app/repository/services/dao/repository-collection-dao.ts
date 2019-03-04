import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Config} from 'app/service/config';
import {takeUntil} from 'rxjs/operators';

import {ActivatedRepository} from '../activated-repository';

import {IdentifiedObject, ListDao} from './list-dao';

@Injectable()
export class RepositoryCollectionDao<T extends IdentifiedObject> extends
    ListDao<T> {
  constructor(
      afAuth: AngularFireAuth, activatedRepository: ActivatedRepository,
      config: Config, subPath: string) {
    super(afAuth, config, subPath);

    activatedRepository.repository.pipe(takeUntil(this.destroyed))
        .subscribe(repository => {
          if (repository) {
            this.path = repository;
          }
        });
  }
}
