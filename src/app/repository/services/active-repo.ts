import {Injectable} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {Dao, RepoStore} from './dao/dao';

@Injectable()
export class ActiveRepo {
  get activeStore(): RepoStore {
    return this.store.value;
  }

  get activeRepository(): string {
    return this.activeStore.repository;
  }

  store = new BehaviorSubject<RepoStore>(
      this.getStoreFromParams(this.activatedRoute.firstChild!.snapshot.params));

  repository = this.store.pipe(map(store => store.repository));

  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private dao: Dao) {
    this.activatedRoute.firstChild!.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      this.store.next(this.getStoreFromParams(params));
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getStoreFromParams(params: Params) {
    const repository = `${params['org']}/${params['name']}`;
    return this.dao.get(repository);
  }
}
