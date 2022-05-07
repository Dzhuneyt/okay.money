import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TransactionListComponent} from './transaction-list/transaction-list.component';
import {RouterModule} from '@angular/router';
import {MaterialComponentsModule} from '../material-components.module';
import {UiKitModule} from '../ui-kit/ui-kit.module';
import {FlexLayoutModule} from '@angular/flex-layout';


@NgModule({
  declarations: [
    TransactionListComponent,
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    UiKitModule,
    RouterModule.forChild([
      {
        path: '',
        component: TransactionListComponent,
      }
    ]),
    FlexLayoutModule,
  ],
})
export class TransactionModule {
}
