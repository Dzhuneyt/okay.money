import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from '../../../services/backend.service';
import {map, take} from 'rxjs/operators';
import {TableColumn, TableComponent} from '../../../table/table.component';
import {Account} from '../../../models/account.model';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './account-summary-list.component.html',
  styleUrls: ['./account-summary-list.component.scss']
})
export class AccountSummaryListComponent implements OnInit {

  @ViewChild(TableComponent, {static: true}) table: TableComponent;

  total = 5;

  public displayedColumns: TableColumn[] = [
    {
      label: 'Name',
      code: 'title',
      footerRenderer: () => '<strong>Total:</strong>',
    },
    {
      label: 'Balance',
      code: 'current_balance',
      footerRenderer: () => {
        return this.total;
      }
    }
  ];

  constructor(
    private backend: BackendService,
  ) {
  }

  public rowFetchers = (page: number, pageSize: number) => {
    return this.backend.request(
      'account',
      'get',
      {
        page: page,
        page_size: pageSize,
      }
    ).pipe(
      take(1),
      map((result: {
        accounts: Account[],
        total_balance: number,
      }) => {
        this.total = result.total_balance;
        return {
          items: result.accounts,
          totalCount: result.accounts.length,
        };
      })
    );
  }

  ngOnInit() {

  }

}
