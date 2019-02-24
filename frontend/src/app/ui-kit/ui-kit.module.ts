import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableComponent} from "../table/table.component";
import {MaterialComponentsModule} from "../material-components.module";

@NgModule({
    declarations: [
        TableComponent
    ],
    imports: [
        CommonModule,
        MaterialComponentsModule,
    ],
    exports: [
        TableComponent,
    ]
})
export class UiKitModule {
}
