import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from "../table/table.component";
import {MaterialComponentsModule} from "../material-components.module";
import {TimeAgoPipe} from "time-ago-pipe";

@NgModule({
  declarations: [
    TableComponent,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
  ],
  exports: [
    TableComponent,
  ]
})
export class UiKitModule {
}
