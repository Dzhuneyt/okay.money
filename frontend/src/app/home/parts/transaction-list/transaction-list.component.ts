import {Component, OnInit, ViewChild} from '@angular/core';
import {TableAction, TableColumn, TableColumnType, TableComponent} from 'src/app/table/table.component';
import {catchError, map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';
import {CategoriesService} from 'src/app/services/categories.service';
import {DialogService} from 'src/app/services/dialog.service';
import {TransactionModel} from 'src/app/models/transaction.model';
import {DeleteConfirmComponent} from 'src/app/delete-confirm/delete-confirm.component';
import {of} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TransactionEditComponent} from 'src/app/transaction-edit/transaction-edit.component';
import {TransactionService} from 'src/app/services/transaction.service';

const columns = [
  {
    label: 'Date',
    code: 'created_at',
    type: TableColumnType.dateTime,
  },
  {
    label: 'Amount',
    code: 'sum',
    renderer: (element: TransactionModel) => {
      if (element.sum > 0) {
        return '<span class="green-text">' + Math.abs(element.sum) + '</span>';
      } else {
        return '<span class="red-text">' + Math.abs(element.sum) + '</span>';
      }
    }
  },
  {
    label: 'Category',
    code: 'category_name',
    renderer: (element: TransactionModel) => {
      return element.category.title;
    }
  },
  {
    label: 'Account',
    code: 'account_name',
    renderer: (element: TransactionModel) => {
      return element.account.title;
    }
  },
  {
    label: 'Description',
    code: 'description',
  },
];

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {

  public pageSize = 10;

  @ViewChild(TableComponent, {static: true}) table: TableComponent;

  public displayedColumns: TableColumn[] = columns;

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
        this.dialog.open(DeleteConfirmComponent, {
            data: {
              title: 'Are you sure you want to delete this transaction?',
              onConfirm: () => {
                return this.backend.request('v1/transactions/' + transaction.id, 'DELETE').pipe(
                  map(res => res === null),
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

  constructor(
    private backend: BackendService,
    private categories: CategoriesService,
    private dialog: DialogService,
    private snackbar: MatSnackBar,
    private transaction: TransactionService,
  ) {
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
