import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CategoryService} from "../category.service";
import {Category} from "../../models/Category";

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {

  public form = new FormGroup({
    id: new FormControl(null, []),
    title: new FormControl(null, []),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CategoryEditComponent>,
    private categoryService: CategoryService,
    private elementRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    if (!this.isNewRecord()) {
      // Edit mode, load existing data
      this.categoryService.getSingle(this.data.id).subscribe((category: Category) => {
        this.form.patchValue({
          id: category.id,
          title: category.title,
        });

        this.elementRef.detectChanges();
      });
    }
  }

  public isNewRecord(): boolean {
    return !this.data.id;
  }

  submit() {
    const payload = {
      'title': this.form.controls['title'].value
    };

    if (this.isNewRecord()) {
      this.categoryService.createSingle(payload).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      // Edit
      this.categoryService.updateSingle(this.data.id, payload).subscribe(res => {
        this.dialogRef.close(true);
      });
    }
  }

}
