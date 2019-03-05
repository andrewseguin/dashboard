import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Filter} from 'app/repository/utility/search/filter';
import {Config} from 'app/service/config';
import {ActivatedRepository} from '../activated-repository';
import {RepositoryCollectionDao} from './repository-collection-dao';



export interface Recommendation {
  id?: string;
  message?: string;
  type?: 'warning' | 'suggestion';
  filters?: Filter[];
  search?: string;
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class RecommendationsDao extends RepositoryCollectionDao<Recommendation> {
  constructor(
    afAuth: AngularFireAuth, activatedRepository: ActivatedRepository,
    config: Config) {
    super(afAuth, activatedRepository, config, 'recommendations');
  }
}
