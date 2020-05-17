import {Component, OnInit, ViewChild} from '@angular/core';
import {TableAction, TableColumn, TableComponent} from 'src/app/table/table.component';
import {TransactionModel} from 'src/app/models/transaction.model';
import {Account} from 'src/app/models/account.model';
import {map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';
import {DialogService} from 'src/app/services/dialog.service';
import {AccountEditComponent} from 'src/app/account-edit/account-edit.component';
import {MatSnackBar} from '@angular/material';

const columns = [
  {
    label: 'Account Name',
    code: 'name',
    renderer: (account: Account) => {
      return account.title;
    }
  },
  {
    label: 'Current Balance',
    code: 'current_balance',
    renderer: (element: Account) => {
      return "to be implemented";
      // return element.current_balance;
    }
  },
];

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {

  public tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (account: Account) => {
        this.dialog.open(AccountEditComponent, {
            data: {
              id: account.id,
            },
            width: '700px'
          },
          (res) => {
            if (res) {
              this.table.goToPage(this.table.currentPage);
              // Refresh the table
            } else {
              this.snackbar.open('Editing failed');
            }
          });
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (transaction: TransactionModel) => {
        alert('todo');
      }
    },
  ];
  public displayedColumns: TableColumn[] = columns;
  @ViewChild(TableComponent, {static: true}) table: TableComponent;
  public pageSize = 10;

  constructor(
    private backend: BackendService,
    private dialog: DialogService,
    private snackbar: MatSnackBar,
  ) {
  }

  ngOnInit() {
  }

  public getPage = (page, pageSize) => {
    let totalCount;
    return this.backend
      .request(
        'account',
        'get',
        {
          page: page,
          page_size: pageSize,
          sort: '-created_at'
        }
      )
      .pipe(
        map((apiResult: Account[]) => {
          // Extract total count
          totalCount = apiResult.length;
          return apiResult;
        }),
        map(items => {
          return {
            items: items,
            totalCount: totalCount
          };
        })
      );

  }

}
