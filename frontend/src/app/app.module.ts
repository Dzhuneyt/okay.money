import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppMaterialComponentsModule} from "./app-material-components.module";
import {FormsModule} from "@angular/forms";
import {BackendService} from "./backend.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AppMaterialComponentsModule,
        // Do not import Angular material components here directly
        // Instead, import them inside AppMaterialComponentsModule
    ],
    providers: [
        BackendService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
