import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {CategoryListComponent} from './category-list/category-list.component';
import {MaterialComponentsModule} from '../material-components.module';
import {UiKitModule} from '../ui-kit/ui-kit.module';
import {CategoryEditComponent} from './category-edit/category-edit.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

const routes: Routes = [
  {
    path: '',
    component: CategoryListComponent,
  }
];

@NgModule({
    declarations: [CategoryListComponent, CategoryEditComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MaterialComponentsModule,
        UiKitModule,
        MatDialogModule,
        ReactiveFormsModule,
        FlexLayoutModule,
    ],
    exports: [
        CategoryEditComponent,
    ]
})
export class CategoryModule {
}
