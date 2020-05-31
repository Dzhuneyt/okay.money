import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {AccountsService} from "src/app/services/accounts.service";
import {Account} from "src/app/models/account.model";

@Component({
  selector: 'app-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.scss']
})
export class AccountEditComponent implements OnInit {

  public form = new FormGroup({
    id: new FormControl(null, []),
    title: new FormControl(null, []),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AccountEditComponent>,
    private account: AccountsService,
    private elementRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    if (this.data.id) {
      // Edit mode, load existing data
      // @TODO Load data from backend and populate form
      this.account.getSingle(this.data.id).subscribe((account: Account) => {
        this.form.controls['id'].setValue(account.id);
        this.form.controls['title'].setValue(account.title);

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
      this.account.createSingle(payload).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      // Edit
      this.account.updateSingle(this.data.id, payload).subscribe(res => {
        this.dialogRef.close(true);
      });
    }
  }

}
