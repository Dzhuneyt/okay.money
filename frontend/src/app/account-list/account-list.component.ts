import {Component, OnInit, ViewChild} from '@angular/core';
import {of} from 'rxjs';
import {TableAction, TableColumn, TableComponent} from 'src/app/table/table.component';
import {Account} from 'src/app/models/account.model';
import {catchError, map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';
import {DialogService} from 'src/app/services/dialog.service';
import {AccountEditComponent} from 'src/app/account-edit/account-edit.component';
import {MatSnackBar} from '@angular/material';
import {DeleteConfirmComponent} from '../delete-confirm/delete-confirm.component';
import {MenuService} from '../menu.service';
import {AccountsService} from '../services/accounts.service';

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
      return element.current_balance;
    }
  },
];

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit {

  private page: number = 1;

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
      onClick: (account: Account) => {
        this.dialog.open(DeleteConfirmComponent, {
            data: {
              title: 'Are you sure you want to delete this account? All transactions inside will be deleted permanently.',
              onConfirm: () => {
                return this.backend.request('account/' + account.id, 'DELETE').pipe(
                  catchError(err => {
                    console.error(err);
                    return of(false);
                  })
                );
              },
            },
          },
          (res) => {
            if (res) {
              // Refresh the table
              this.snackbar.open('Deleted');
              this.table.goToPage(this.table.currentPage);
            } else {
              this.snackbar.open('Deleting failed');
            }
          });
      }
    },
  ];
  public displayedColumns: TableColumn[] = columns;
  @ViewChild(TableComponent, {static: true}) table: TableComponent;
  public pageSize = 1000;

  constructor(
    private backend: BackendService,
    private dialog: DialogService,
    private snackbar: MatSnackBar,
    private menu: MenuService,
    private account: AccountsService,
  ) {
  }

  ngOnInit() {

    this.menu.items.next([
      {
        label: "Create account",
        matIcon: "add",
        onClick: () => {
          this.dialog.open(AccountEditComponent, {
              data: {},
              width: '700px'
            },
            (res) => {
              if (res) {
                this.account.changes.next();
              } else {
                this.snackbar.open('Creating transaction failed');
              }
            });
        }
      }
    ]);

    this.account.changes.subscribe(() => {
      this.table.goToPage(this.table.currentPage);
    });
  }

  public getPage = (page, pageSize) => {
    this.page = page;

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
