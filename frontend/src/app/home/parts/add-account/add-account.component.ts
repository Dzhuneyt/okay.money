import {Component, Input, OnInit} from '@angular/core';
import {BackendService} from "../../../services/backend.service";
import {MatDialogRef} from "@angular/material";

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.scss']
})
export class AddAccountComponent implements OnInit {

  @Input() name: string;

  constructor(
    private backend: BackendService,
    public dialogRef: MatDialogRef<AddAccountComponent>
  ) {
  }

  ngOnInit() {
  }

  public submit() {
    this.backend.request('v1/accounts', 'POST', {}, {
      name: this.name
    }).subscribe(result => {
      this.dialogRef.close(true);
    });
  }
}
