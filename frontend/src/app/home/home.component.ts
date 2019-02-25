import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";
import {MatDialog} from "@angular/material";
import {AddAccountComponent} from "./parts/add-account/add-account.component";
import {DialogService} from "../services/dialog.service";

interface Account {
  id?: number;
  name: string;
  starting_balance: number;
  current_balance: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private backend: BackendService,
    private MatDialog: MatDialog,
    private DialogService: DialogService,
  ) {
  }

  ngOnInit() {

  }

  public openAddAccountModal() {
    this.DialogService.open(AddAccountComponent, {
      width: '600px'
    }, (res) => {
      console.log(res);
    });
  }

}
