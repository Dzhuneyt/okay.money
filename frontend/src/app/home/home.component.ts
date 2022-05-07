import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material/tabs';
import {AccountSummaryListComponent} from 'src/app/home/parts/accounts-list/account-summary-list.component';
import {UserService} from '../services/user.service';
import {Title} from "@angular/platform-browser";

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
    private title: Title,
  ) {
  }

  ngOnInit() {
    this.title.setTitle('Dashboard');
  }

}
