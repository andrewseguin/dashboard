import {ChangeDetectionStrategy, Component, Input, SimpleChanges, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatSelect} from '@angular/material';
import {ItemSorter} from 'app/package/items-renderer/item-sorter';

@Component({
  selector: 'sort-state-option',
  template: `
    <div class="config-option">
      <div class="label"> {{label}} </div>
      <div class="option">
        <mat-select class="theme-border auto-width" #sortIdSelect="matSelect"
                    (valueChange)="onChange({sort: $event, reverse: sortDirSelect.value})">
          <mat-option *ngFor="let sortId of sortIds" [value]="sortId">
            {{sorter.metadata.get(sortId)?.label}}
          </mat-option>
        </mat-select>
        <mat-select class="theme-border auto-width" #sortDirSelect="matSelect"
                    (valueChange)="onChange({sort: sortIdSelect.value, reverse: $event})">
          <mat-option [value]="false"> Ascending </mat-option>
          <mat-option [value]="true"> Descending </mat-option>
        </mat-select>
      </div>
    </div>
  `,
  styleUrls: ['../../edit-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: SortStateOption, multi: true}]
})
export class SortStateOption<S> implements ControlValueAccessor {
  sortIds: S[] = [];

  onChange = (_: any) => {};

  onTouched = () => {};

  @ViewChild('sortIdSelect') sortId: MatSelect;

  @ViewChild('sortDirSelect') sortDir: MatSelect;

  @Input() label: string;

  @Input() sorter: ItemSorter<any, S, any>;

  @Input() placeholder: string;

  @Input() type: number;

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['sorter']) {
      this.sortIds = this.sorter.getSorts().map(value => value.id);
      this.sortId.value = this.sortIds[0];
      this.sortDir.value = false;
    }
  }

  writeValue(value: any): void {
    if (value) {
      this.sortId.value = value.sort;
      this.sortDir.value = value.reverse;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.sortId.disabled = isDisabled;
    this.sortDir.disabled = isDisabled;
  }
}
