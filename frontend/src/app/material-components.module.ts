import {NgModule} from "@angular/core";
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule
} from "@angular/material";

export const USED_ANGULAR_MATERIAL_COMPONENTS = [
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule,
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