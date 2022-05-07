import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from './table/table.component';
import {MaterialComponentsModule} from '../material-components.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RelativeTimePipe} from './RelativeTimePipe/RelativeTimePipe';

@NgModule({
  declarations: [
    TableComponent,
    RelativeTimePipe,
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FlexLayoutModule,
  ],
  exports: [
    TableComponent,
    FlexLayoutModule,
  ]
})
export class UiKitModule {
}
