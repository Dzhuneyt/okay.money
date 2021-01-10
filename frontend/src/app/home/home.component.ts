import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from '../services/backend.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTabGroup} from '@angular/material/tabs';
import {AddAccountComponent} from './parts/add-account/add-account.component';
import {DialogService} from '../services/dialog.service';
import {AccountSummaryListComponent} from 'src/app/home/parts/accounts-list/account-summary-list.component';
import {UserService} from "../services/user.service";
import {MenuService} from "../menu.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(AccountSummaryListComponent, {static: true}) accountListComponent;

  @ViewChild(MatTabGroup) public tabs: MatTabGroup;

  constructor(
    public user: UserService,
    public menuService: MenuService,
  ) {
  }

  ngOnInit() {

  }

}
