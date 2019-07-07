import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from '../services/backend.service';
import {MatDialog, MatSnackBar, MatTabGroup} from '@angular/material';
import {AddAccountComponent} from './parts/add-account/add-account.component';
import {DialogService} from '../services/dialog.service';
import {AccountsListComponent} from './parts/accounts-list/accounts-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(AccountsListComponent) accountListComponent;

  @ViewChild(MatTabGroup) public tabs: MatTabGroup;

  constructor(
    private backend: BackendService,
    private matDialog: MatDialog,
    private dialogService: DialogService,
    private snackbar: MatSnackBar,
  ) {
  }

  public statsPeriodChange(event) {
    console.log(event);
    // @TODO trigger API call
  }

  ngOnInit() {

  }

  public openAddAccountModal() {
    this.dialogService.open(AddAccountComponent, {
      width: '600px'
    }, (res) => {
      this.accountListComponent.goToPage();

      this.snackbar.open('Account successfully created', null, {
        duration: 1000,
      });
    });
  }

}
