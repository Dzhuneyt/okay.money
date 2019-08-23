import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BackendService} from './services/backend.service';
import {HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {HeaderModule} from './header/header.module';
import {MaterialComponentsModule} from './material-components.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AccountSummaryListComponent} from 'src/app/home/parts/accounts-list/account-summary-list.component';
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
import {MatListModule, MatSlideToggleModule} from '@angular/material';
import {DeleteConfirmComponent} from 'src/app/delete-confirm/delete-confirm.component';
import {TransactionEditComponent} from 'src/app/transaction-edit/transaction-edit.component';
import {TransactionService} from 'src/app/services/transaction.service';
import {LoggedInGuard} from "src/app/guards/logged-in.guard";
import {AnonymousUserGuard} from "src/app/guards/anonymous-user.guard";
import {AccountListComponent} from "src/app/account-list/account-list.component";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AnonymousUserGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'transactions',
    component: TransactionListComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'accounts',
    component: AccountListComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: '**',
    redirectTo: '/home',
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    AccountSummaryListComponent,
    AddAccountComponent,
    TransactionListComponent,
    StatsByCategoryComponent,
    SidenavComponent,
    DeleteConfirmComponent,
    TransactionEditComponent,
    AccountListComponent,
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
    ReactiveFormsModule,
    MatSlideToggleModule,
  ],
  providers: [
    BackendService,
    DialogService,
    AccountsService,
    CategoriesService,
    UserService,
    TransactionService,
  ],
  entryComponents: [
    AddAccountComponent,
    DeleteConfirmComponent,
    TransactionEditComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
