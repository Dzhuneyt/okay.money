import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from '../table/table.component';
import {MaterialComponentsModule} from '../material-components.module';
import {TimeAgoPipe} from 'time-ago-pipe';
import {FlexModule} from '@angular/flex-layout';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoExtendsPipe extends TimeAgoPipe implements PipeTransform {
}

@NgModule({
  declarations: [
    TableComponent,
    TimeAgoExtendsPipe,
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
