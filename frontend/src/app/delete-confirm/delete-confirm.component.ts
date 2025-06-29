import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';

// @TODO Move to UiKit module
@Component({
  selector: 'app-delete-confirm',
  templateUrl: './delete-confirm.component.html',
  styleUrls: ['./delete-confirm.component.scss']
})
export class DeleteConfirmComponent implements OnInit {

  public title: string;
  public body: string;
  public onConfirm: () => Observable<any>;

  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteConfirmComponent>
  ) {
  }

  ngOnInit() {
    this.title = this.data.title;
    this.body = this.data.body;
    this.onConfirm = this.data.onConfirm;
  }

  submit() {
    this.isLoading = true;
    this.onConfirm()
      .pipe(take(1))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

}
