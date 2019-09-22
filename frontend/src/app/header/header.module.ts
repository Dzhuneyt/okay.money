import {NgModule} from '@angular/core';
import {HeaderComponent} from './component/header.component';
import {MaterialComponentsModule} from '../material-components.module';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    MaterialComponentsModule,
    RouterModule,
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule {
}
