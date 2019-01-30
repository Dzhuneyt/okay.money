import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MaterialComponentsModule} from "./material-components.module";
import {FormsModule} from "@angular/forms";
import {BackendService} from "./backend.service";
import {HttpClientModule} from "@angular/common/http";
import {HomeComponent} from "./home/home.component";

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialComponentsModule,
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
