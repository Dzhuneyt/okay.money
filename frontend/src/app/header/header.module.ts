import {NgModule} from '@angular/core';
import {HeaderComponent} from './component/header.component';
import {MaterialComponentsModule} from "../material-components.module";

@NgModule({
    declarations: [
        HeaderComponent
    ],
    imports: [
        MaterialComponentsModule,
    ],
    exports: [
        HeaderComponent
    ]
})
export class HeaderModule {
}
