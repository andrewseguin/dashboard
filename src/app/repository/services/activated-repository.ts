import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class ActivatedRepository {
  repository = new BehaviorSubject<string|null>(null);
}
