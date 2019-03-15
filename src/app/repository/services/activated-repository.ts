import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ActivatedRepository {
  repository = new BehaviorSubject<string|null>(null);
}
