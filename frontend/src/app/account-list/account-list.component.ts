import {Component, OnInit, ViewChild} from '@angular/core';
import {of} from 'rxjs';
import {TableAction, TableColumn, TableComponent, TableGlobalAction} from 'src/app/table/table.component';
import {Account} from 'src/app/models/account.model';
import {catchError, map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';
import {DialogService} from 'src/app/services/dialog.service';
import {AccountEditComponent} from 'src/app/account-edit/account-edit.component';
import {DeleteConfirmComponent} from '../delete-confirm/delete-confirm.component';
import {MenuService} from '../menu.service';
import {AccountsService} from '../services/accounts.service';
import {SnackbarService} from '../services/snackbar.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss'],
})
export class AccountListComponent implements OnInit {

  @ViewChild(TableComponent, {static: true}) table: TableComponent;

  public displayedColumns: TableColumn[] = [
    {
      label: 'Account Name',
      code: 'title',
    },
  ];
  public tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (account: Account) => this.openEditAccountDialog(account)
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (account: Account) => this.openDeleteAccountDialog(account),
    },
  ];
  public pageSize = 1000;
  public footerActions: TableGlobalAction[] = [
    {
      label: 'Create account',
      icon: 'add',
      onClick: () => this.openCreateAccountDialog(),
    },
  ];
  private page = 1;

  constructor(
    private backendService: BackendService,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
    private menuService: MenuService,
    private accountsService: AccountsService,
  ) {
  }

  ngOnInit() {
    this.accountsService.changes.subscribe(() => {
      this.table.goToPage(this.table.currentPage);
    });
  }

  public getPage = (page, pageSize) => {
    this.page = page;

    let totalCount;
    return this.backendService.request(
      'account',
      'get',
      {
        page: page,
        page_size: pageSize,
        sort: '-created_at'
      }
    ).pipe(
      map(res => res.accounts),
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

  private openEditAccountDialog(account: Account) {
    this.dialogService.open(AccountEditComponent, {
        data: {
          id: account.id,
        },
        width: '700px'
      },
      (res) => {
        if (res) {
          // Refresh the table
          this.table.goToPage(this.table.currentPage);
          this.snackbarService.success('Account modified');
        } else {
          this.snackbarService.error('Editing failed');
        }
      });
  }

  private openDeleteAccountDialog(account: Account) {
    this.dialogService.open(DeleteConfirmComponent, {
        data: {
          title: 'Are you sure you want to delete this account? All transactions inside will be deleted permanently.',
          onConfirm: () => {
            return this.backendService.request('account/' + account.id, 'DELETE').pipe(
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
          this.snackbarService.success('Deleted');
          this.table.goToPage(this.table.currentPage);
        } else {
          this.snackbarService.error('Deleting failed');
        }
      });
  }

  private openCreateAccountDialog() {
    this.dialogService.open(AccountEditComponent, {
        data: {},
        width: '700px'
      },
      (res) => {
        switch (res) {
          case true:
            this.accountsService.changes.next({});
            this.snackbarService.success('Account created');
            break;
          case false:
            this.snackbarService.error('Account creation failed');
            break;
          default:
          // Dialog was closed through the cancel button
        }
      });
  }
}
