import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BackendService} from './services/backend.service';
import {HttpClientModule} from '@angular/common/http';
import {HomeComponent} from './home/home.component';
import {HeaderModule} from './header/header.module';
import {MaterialComponentsModule} from './material-components.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AccountSummaryListComponent} from 'src/app/home/parts/accounts-list/account-summary-list.component';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {UiKitModule} from './ui-kit/ui-kit.module';
import {AddAccountComponent} from './home/parts/add-account/add-account.component';
import {DialogService} from './services/dialog.service';
import {AccountsService} from './services/accounts.service';
import {CategoriesService} from './services/categories.service';
import {NgChartsModule} from 'ng2-charts';
import {StatsByCategoryComponent} from 'src/app/stats-by-category/stats-by-category.component';
import {UserService} from 'src/app/services/user.service';
import {CommonModule} from '@angular/common';
import {SidenavComponent} from 'src/app/sidenav/sidenav.component';
import {DeleteConfirmComponent} from 'src/app/delete-confirm/delete-confirm.component';
import {TransactionService} from 'src/app/services/transaction.service';
import {LoggedInGuard} from 'src/app/guards/logged-in.guard';
import {AnonymousUserGuard} from 'src/app/guards/anonymous-user.guard';
import {AccountListComponent} from 'src/app/account-list/account-list.component';
import {AccountEditComponent} from 'src/app/account-edit/account-edit.component';
import {ProfileComponent} from 'src/app/profile/profile.component';
import {StorageModule} from '@ngx-pwa/local-storage';
import {WelcomeComponent} from './welcome/welcome.component';
import {FooterComponent} from './footer/footer.component';
import {PrivacyPolicyComponent} from './privacy-policy/privacy-policy.component';
import {CookiePolicyComponent} from './cookie-policy/cookie-policy.component';
import {CookieInformationPopupComponent} from './cookie-information-popup/cookie-information-popup.component';
import {CookieService} from './cookie.service';
import {FeedbackComponent} from './feedback/feedback.component';
import {TransactionEditComponent} from "./transaction-edit/transaction-edit.component";

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [AnonymousUserGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'transactions',
    loadChildren: () => import('./transaction/transaction.module').then(m => m.TransactionModule),
    canActivate: [LoggedInGuard],
  },
  {
    // @TODO refactor into lazy loaded module
    path: 'accounts',
    component: AccountListComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'categories',
    loadChildren: () => import('./category/category.module').then(m => m.CategoryModule),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [LoggedInGuard],
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'cookie-policy',
    component: CookiePolicyComponent,
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AccountSummaryListComponent,
    AddAccountComponent,
    StatsByCategoryComponent,
    SidenavComponent,
    DeleteConfirmComponent,
    AccountListComponent,
    AccountEditComponent,
    ProfileComponent,
    WelcomeComponent,
    FooterComponent,
    CookiePolicyComponent,
    PrivacyPolicyComponent,
    CookieInformationPopupComponent,
    FeedbackComponent,
    TransactionEditComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
    BrowserAnimationsModule,
    MaterialComponentsModule,
    NgChartsModule,
    UiKitModule,
    HeaderModule,
    ReactiveFormsModule,
    StorageModule.forRoot({LSPrefix: 'okaymoney_'}),
  ],
  providers: [
    BackendService,
    DialogService,
    AccountsService,
    CategoriesService,
    UserService,
    TransactionService,
    CookieService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
