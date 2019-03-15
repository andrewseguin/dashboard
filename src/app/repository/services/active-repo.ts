import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ActiveRepo {
  repository = new BehaviorSubject<string|null>(null);
}
