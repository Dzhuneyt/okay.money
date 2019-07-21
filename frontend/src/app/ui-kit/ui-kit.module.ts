import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from '../table/table.component';
import {MaterialComponentsModule} from '../material-components.module';
import {TimeAgoPipe} from 'time-ago-pipe';
import {FlexModule} from '@angular/flex-layout';

@NgModule({
  declarations: [
    TableComponent,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    FlexModule,
  ],
  exports: [
    TableComponent,
  ]
})
export class UiKitModule {
}
