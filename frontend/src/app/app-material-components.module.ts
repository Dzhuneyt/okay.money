import {NgModule} from "@angular/core";
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
} from "@angular/material";

const USED_ANGULAR_MATERIAL_COMPONENTS = [
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
];

@NgModule({
    imports: [
        ...USED_ANGULAR_MATERIAL_COMPONENTS
    ],
    exports: [
        ...USED_ANGULAR_MATERIAL_COMPONENTS
    ],
})
export class AppMaterialComponentsModule {

}