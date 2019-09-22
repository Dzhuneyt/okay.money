import {NgModule} from '@angular/core';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule
} from '@angular/material';

export const USED_ANGULAR_MATERIAL_COMPONENTS = [
  MatCardModule,
  MatFormFieldModule,
  MatProgressSpinnerModule,
  MatInputModule,
  MatButtonModule,
  MatSnackBarModule,
  MatIconModule,
  MatToolbarModule,
  MatSidenavModule,
  MatCardModule,
  MatTableModule,
  MatPaginatorModule,
  MatDialogModule,
  MatSelectModule,
  MatTabsModule,
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
