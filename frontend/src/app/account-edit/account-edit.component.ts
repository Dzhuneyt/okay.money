import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA} from "@angular/material";
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
    name: new FormControl(null, []),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
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
        this.form.controls['name'].setValue(account.name);

        this.elementRef.detectChanges();
      });
    }
  }

  public isNewRecord(): boolean {
    return !this.data.id;
  }

  submit() {
    alert('todo');
  }

}
