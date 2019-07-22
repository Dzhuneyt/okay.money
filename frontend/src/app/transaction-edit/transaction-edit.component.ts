import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TransactionService} from "src/app/services/transaction.service";
import {TransactionModel} from "src/app/models/transaction.model";

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss']
})
export class TransactionEditComponent implements OnInit {

  public form = new FormGroup({
    id: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
    sum: new FormControl(null, [Validators.required]),
    type: new FormControl('expense', [Validators.required]),
    category_id: new FormControl(null, [Validators.required]),
    account_id: new FormControl(null, [Validators.required]),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private transaction: TransactionService,
    public dialogRef: MatDialogRef<TransactionEditComponent>,
    private elementRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    if (this.data.id) {
      // Edit mode, load existing data
      // @TODO Load data from backend and populate form
      this.transaction.getSingle(this.data.id).subscribe((transaction: TransactionModel) => {
        this.form.controls['id'].setValue(transaction.id);
        this.form.controls['description'].setValue(transaction.description);
        this.form.controls['sum'].setValue(transaction.sum);
        this.form.controls['type'].setValue(transaction.sum < 0 ? 'expense' : 'income');
        this.form.controls['category_id'].setValue(transaction.category.id);
        this.form.controls['account_id'].setValue(transaction.account.id);

        this.elementRef.detectChanges();
      });
    }
  }

  public isNewRecord(): boolean {
    return !this.data.id;
  }

  public submit() {
    console.log('@TODO');
  }

}
