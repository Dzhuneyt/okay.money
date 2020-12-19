import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TransactionService} from 'src/app/services/transaction.service';
import {TransactionModel} from 'src/app/models/transaction.model';
import {CategoriesService, Category} from 'src/app/services/categories.service';
import {AccountsService} from 'src/app/services/accounts.service';
import {map, take} from 'rxjs/operators';
import {Account} from 'src/app/models/account.model';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
  styleUrls: ['./transaction-edit.component.scss']
})
export class TransactionEditComponent implements OnInit {

  public form = new FormGroup({
    id: new FormControl(null, []),
    description: new FormControl(null, []),
    sum: new FormControl(null, [Validators.required]),
    type: new FormControl('expense', [Validators.required]),
    category_id: new FormControl(null, [Validators.required]),
    account_id: new FormControl(null, [Validators.required]),
  });

  public categories: Category[] = [];
  public accounts: Account[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private transaction: TransactionService,
    public dialogRef: MatDialogRef<TransactionEditComponent>,
    private elementRef: ChangeDetectorRef,
    private accountService: AccountsService,
    private categoryService: CategoriesService,
  ) {
  }

  ngOnInit() {
    if (this.data.id) {
      // Edit mode, load existing data
      // @TODO Load data from backend and populate form
      this.transaction.getSingle(this.data.id).subscribe((transaction: TransactionModel) => {
        this.form.controls['id'].setValue(transaction.id);
        this.form.controls['description'].setValue(transaction.description);
        this.form.controls['sum'].setValue(Math.abs(transaction.sum));
        this.form.controls['type'].setValue(transaction.sum < 0 ? 'expense' : 'income');
        this.form.controls['category_id'].setValue(transaction.category.id);
        this.form.controls['account_id'].setValue(transaction.account.id);

        this.elementRef.detectChanges();
      });
    }

    this.accountService.getList().pipe(
      take(1),
      map(accounts => this.accounts = accounts),
    ).subscribe(res => {
      console.log(this.accounts);
    });
    this.categoryService.getList().pipe(
      take(1),
      map(cats => this.categories = cats),
    ).subscribe(res => {
      console.log(this.categories);
    });
  }

  public isNewRecord(): boolean {
    return !this.data.id;
  }

  public submit() {
    const payload = {};

    if (this.form.controls['type'].value === 'expense') {
      payload['sum'] = -Math.abs(this.form.controls['sum'].value);
    } else {
      payload['sum'] = Math.abs(this.form.controls['sum'].value);
    }

    payload['description'] = this.form.controls['description'].value;
    payload['category_id'] = this.form.controls['category_id'].value;
    payload['account_id'] = this.form.controls['account_id'].value;

    if (this.isNewRecord()) {
      // Create
      // @TODO create transaction
      this.transaction.createSingle(payload).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      // Edit
      this.transaction.updateSingle(this.data.id, payload).subscribe(res => {
        console.log(res);

        this.dialogRef.close(true);
      });
    }
  }

}
