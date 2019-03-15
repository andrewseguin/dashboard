import {Injectable} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

@Injectable()
export class ActiveRepo {
  set repository(repository: string) {
    this._repository.next(repository);
  }
  get repository(): string {
    return this._repository.value;
  }
  _repository = new BehaviorSubject<string>(
      this.getRepositoryFromParams(this.activatedRoute.firstChild!.snapshot.params));

  change: Observable<string> = this._repository.pipe(filter(v => !!v)) as Observable<string>;

  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.firstChild!.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      this.repository = this.getRepositoryFromParams(params);
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private getRepositoryFromParams(params: Params) {
    const org = params['org'];
    const name = params['name'];
    return `${org}/${name}`;
  }
}
