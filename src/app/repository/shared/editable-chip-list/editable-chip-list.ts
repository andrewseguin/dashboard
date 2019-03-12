import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {merge, Observable, Subject} from 'rxjs';
import {delay, map, startWith} from 'rxjs/operators';

@Component({
  selector: 'editable-chip-list',
  styleUrls: ['editable-chip-list.scss'],
  templateUrl: 'editable-chip-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'class': 'theme-border'}
})
export class EditableChipList {
  formControl = new FormControl();

  filteredAutocomplete: Observable<string[]>;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input() label: string;

  @Input() autocomplete: string[];

  @Input()
  set values(v: string[]) {
    this._values = (v || []).slice();
  }
  get values(): string[] {
    return this._values;
  }
  _values: string[] = [];

  @Output() listChange = new EventEmitter<string[]>();

  @Input() transform = v => v;

  @Input() placeholder = '';

  @ViewChild('chipInput') chipInput: ElementRef;

  private _destroyed = new Subject();

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['autocomplete']) {
      this.filteredAutocomplete =
          merge(this.formControl.valueChanges, this.listChange.pipe(delay(100)))
              .pipe(
                  startWith(null),
                  map(() => this.formControl.value ? this._filter(this.formControl.value) :
                                                     this.autocomplete.slice()));
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  add(value: string): void {
    value = (value || '').trim();
    if (!value) {
      return;
    }

    this.values.push(this.transform(value));
    this.chipInput.nativeElement.value = '';
    this.listChange.emit(this.values);
  }

  remove(email: string) {
    const index = this.values.indexOf(email);
    if (index >= 0) {
      this.values.splice(index, 1);
    }

    this.listChange.emit(this.values);
  }

  private _filter(value: string): string[] {
    return this.autocomplete.filter(v => v.toLowerCase().indexOf(value.toLowerCase()) === 0);
  }
}
