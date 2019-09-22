import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Observable} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-delete-confirm',
  templateUrl: './delete-confirm.component.html',
  styleUrls: ['./delete-confirm.component.scss']
})
export class DeleteConfirmComponent implements OnInit {

  public title: string;
  public body: string;
  public onConfirm: () => Observable<any>;

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
    this
      .onConfirm()
      .pipe(take(1))
      .subscribe((res) => {
        this.dialogRef.close(res);
      });
  }

}
