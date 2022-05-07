import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AccountsService} from 'src/app/services/accounts.service';
import {tap} from 'rxjs/operators';

@Component({
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.scss']
})
export class AccountEditComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AccountEditComponent>,
    private account: AccountsService,
  ) {
  }

  public form = new FormGroup({
    id: new FormControl(null, []),
    title: new FormControl(null, []),
  });

  isLoading = true;

  ngOnInit() {
    if (this.data.id) {
      // Edit mode, load existing data
      this.account.getSingle(this.data.id)
        .pipe(tap((account) => this.form.patchValue(account)))
        .pipe(tap((account) => this.isLoading = false))
        .subscribe();
      return;
    }
    this.isLoading = false;
  }

  public isNewRecord = () => !!(!this.data.id);

  submit() {
    const payload = {
      'title': this.form.get('title').value,
    };

    if (this.isNewRecord()) {
      this.account.createSingle(payload)
        .pipe(tap(() => this.dialogRef.close(true)))
        .subscribe();
      return;
    }
    // Edit
    this.account.updateSingle(this.data.id, payload)
      .pipe(tap(() => this.dialogRef.close(true)))
      .subscribe();
  }

}
