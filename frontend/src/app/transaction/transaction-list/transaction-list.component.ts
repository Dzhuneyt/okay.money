import {Component, OnInit, ViewChild} from '@angular/core';
import {TableAction, TableColumn, TableComponent, TableGlobalAction} from 'src/app/ui-kit/table/table.component';
import {catchError, map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';
import {CategoriesService} from 'src/app/services/categories.service';
import {DialogService} from 'src/app/services/dialog.service';
import {TransactionModel} from 'src/app/models/transaction.model';
import {DeleteConfirmComponent} from 'src/app/delete-confirm/delete-confirm.component';
import {of} from 'rxjs';
import {TransactionEditComponent} from 'src/app/transaction-edit/transaction-edit.component';
import {TransactionService} from 'src/app/services/transaction.service';
import {SnackbarService} from '../../services/snackbar.service';
import {TransactionListColumns} from './transaction-list.columns';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {

  public pageSize = 10000; // @TODO fix pagination

  @ViewChild(TableComponent, {static: true}) table: TableComponent;

  public displayedColumns: TableColumn[] = TransactionListColumns;

  public tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (transaction: TransactionModel) => {
        this.dialog.open(TransactionEditComponent, {
            data: {
              id: transaction.id,
            },
            width: '700px'
          },
          (res) => {
            if (res) {
              // Refresh the table
              this.table.goToPage(this.table.currentPage);
              return;
            }
            if (res === false) {
              this.snackbarService.error('Editing failed');
            }
          });
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (transaction: TransactionModel) => {
        this.dialog.open(DeleteConfirmComponent, {
            data: {
              title: 'Are you sure you want to delete this transaction?',
              onConfirm: () => this.backend.request('transaction/' + transaction.id, 'DELETE').pipe(
                catchError(err => {
                  console.error(err);
                  return of(false);
                })
              ),
            },
          },
          (res) => {
            if (res) {
              // Refresh the table
              this.snackbarService.success('Deleted');
              this.table.goToPage(this.table.currentPage);
              return;
            }
            if (res === false) {
              this.snackbarService.error('Delete failed');
            }
          });
      }
    },
  ];

  public footerActions: TableGlobalAction[] = [
    {
      label: 'Create a transaction',
      icon: 'add',
      onClick: () => {
        this.dialog.open(TransactionEditComponent, {
            data: {},
            width: '700px'
          },
          (res) => {
            if (res) {
              this.transaction.changes.next({});
            } else if (res === false) {
              this.snackbarService.error('Creating failed');
            }
          });
      },
    }
  ];

  constructor(
    private backend: BackendService,
    private categories: CategoriesService,
    private dialog: DialogService,
    private transaction: TransactionService,
    private snackbarService: SnackbarService,
    private title: Title,
  ) {
    this.title.setTitle('Transactions');
  }

  ngOnInit() {
    // On serious changes to the transactions, reinitialize the table
    this.transaction.changes.subscribe(() => {
      this.table.goToPage(0);
    });
  }

  public getPage = (page, pageSize) => {
    let totalCount;
    return this.backend
      .request(
        'transaction',
        'get',
        {
          page: page,
          page_size: pageSize,
          sort: '-created_at'
        }
      )
      .pipe(
        map(apiResult => {
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
