import {Component, Input, OnInit} from '@angular/core';
import {BackendService} from '../../../services/backend.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {

  @Input() title: string;

  constructor(
    private backend: BackendService,
    public dialogRef: MatDialogRef<AddAccountComponent>
  ) {
  }

  ngOnInit() {
  }

  public submit() {
    this.backend.request('account', 'POST', {}, {
      title: this.title
    }).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}
