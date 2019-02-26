import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {BackendService} from "./services/backend.service";
import {HttpClientModule} from "@angular/common/http";
import {HomeComponent} from "./home/home.component";
import {HeaderModule} from "./header/header.module";
import {MaterialComponentsModule} from "./material-components.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {AccountsListComponent} from "./home/parts/accounts-list/accounts-list.component";
import {RouterModule, Routes} from "@angular/router";
import {UiKitModule} from "./ui-kit/ui-kit.module";
import {TransactionListComponent} from "./home/parts/transaction-list/transaction-list.component";
import {AddAccountComponent} from "./home/parts/add-account/add-account.component";
import {DialogService} from "./services/dialog.service";
import {AccountsService} from "./services/accounts.service";
import {CategoriesService} from "./services/categories.service";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    AccountsListComponent,
    AddAccountComponent,
    TransactionListComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MaterialComponentsModule,
    UiKitModule,

    HeaderModule,
  ],
  providers: [
    BackendService,
    DialogService,
    AccountsService,
    CategoriesService,
  ],
  entryComponents: [
    AddAccountComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
