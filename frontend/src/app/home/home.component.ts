import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from "../services/backend.service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {AddAccountComponent} from "./parts/add-account/add-account.component";
import {DialogService} from "../services/dialog.service";
import {AccountsListComponent} from "./parts/accounts-list/accounts-list.component";

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

  @ViewChild(AccountsListComponent) accountListComponent;

  constructor(
    private backend: BackendService,
    private MatDialog: MatDialog,
    private DialogService: DialogService,
    private snackbar: MatSnackBar,
  ) {
  }

  ngOnInit() {

  }

  public openAddAccountModal() {
    this.DialogService.open(AddAccountComponent, {
      width: '600px'
    }, (res) => {
      this.accountListComponent.goToPage();

      this.snackbar.open('Account successfully created', null, {
        duration: 1000,
      });
    });
  }

}
