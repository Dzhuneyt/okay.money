import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from '../services/backend.service';
import {MatDialog, MatSnackBar, MatTabGroup} from '@angular/material';
import {AddAccountComponent} from './parts/add-account/add-account.component';
import {DialogService} from '../services/dialog.service';
import {AccountSummaryListComponent} from 'src/app/home/parts/accounts-list/account-summary-list.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(AccountSummaryListComponent) accountListComponent;

  @ViewChild(MatTabGroup) public tabs: MatTabGroup;

  constructor(
    private backend: BackendService,
    private matDialog: MatDialog,
    private dialogService: DialogService,
    private snackbar: MatSnackBar,
  ) {
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
