import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {BackendService} from './services/backend.service';
import {HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {HeaderModule} from './header/header.module';
import {MaterialComponentsModule} from './material-components.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AccountsListComponent} from './home/parts/accounts-list/accounts-list.component';
import {RouterModule, Routes} from '@angular/router';
import {UiKitModule} from './ui-kit/ui-kit.module';
import {TransactionListComponent} from './home/parts/transaction-list/transaction-list.component';
import {AddAccountComponent} from './home/parts/add-account/add-account.component';
import {DialogService} from './services/dialog.service';
import {AccountsService} from './services/accounts.service';
import {CategoriesService} from './services/categories.service';
import {ChartsModule} from 'ng2-charts';
import {StatsByCategoryComponent} from 'src/app/stats-by-category/stats-by-category.component';
import {UserService} from 'src/app/services/user.service';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from 'src/app/sidenav/sidenav.component';
import {MatListModule} from '@angular/material';
import {TransactionDeleteModalComponent} from 'src/app/transaction-delete-modal/transaction-delete-modal.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'transactions',
    component: TransactionListComponent,
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
    StatsByCategoryComponent,
    SidenavComponent,
    TransactionDeleteModalComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MaterialComponentsModule,
    ChartsModule,
    UiKitModule,

    HeaderModule,
    MatListModule,
  ],
  providers: [
    BackendService,
    DialogService,
    AccountsService,
    CategoriesService,
    UserService,
  ],
  entryComponents: [
    AddAccountComponent,
    TransactionDeleteModalComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
