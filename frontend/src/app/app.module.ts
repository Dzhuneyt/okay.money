import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {BackendService} from "./backend.service";
import {HttpClientModule} from "@angular/common/http";
import {HomeComponent} from "./home/home.component";
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTableModule
} from "@angular/material";
import {HeaderModule} from "./header/header.module";
import {MaterialComponentsModule} from "./material-components.module";
import {CardComponent} from "./card/card.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import {AccountsListComponent} from "./accounts-list/accounts-list.component";
import {TableComponent} from "./table/table.component";

const USED_ANGULAR_MATERIAL_COMPONENTS = [
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        CardComponent,
        AccountsListComponent,

        // UI components
        TableComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        FlexLayoutModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialComponentsModule,

        HeaderModule,

        MatSidenavModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
    ],
    providers: [
        BackendService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
