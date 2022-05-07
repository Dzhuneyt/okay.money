import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';

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
