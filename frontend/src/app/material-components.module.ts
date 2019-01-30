import {NgModule} from "@angular/core";
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
} from "@angular/material";

const USED_ANGULAR_MATERIAL_COMPONENTS = [
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
];

@NgModule({
    imports: [
        ...USED_ANGULAR_MATERIAL_COMPONENTS
    ],
    exports: [
        ...USED_ANGULAR_MATERIAL_COMPONENTS
    ],
})
export class MaterialComponentsModule {

}