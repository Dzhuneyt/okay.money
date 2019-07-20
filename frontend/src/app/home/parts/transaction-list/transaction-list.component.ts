import {Component, OnInit} from '@angular/core';
import {TableAction, TableColumn, TableColumnType} from 'src/app/table/table.component';
import {map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';
import {CategoriesService} from 'src/app/services/categories.service';
import {DialogService} from "src/app/services/dialog.service";
import {TransactionDeleteModalComponent} from "src/app/transaction-delete-modal/transaction-delete-modal.component";
import {TransactionModel} from "src/app/models/transaction.model";

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {

  public displayedColumns: TableColumn[] = [
    {
      label: 'Date',
      code: 'created_at',
      type: TableColumnType.dateTime,
    },
    {
      label: 'Amount',
      code: 'sum',
    },
    {
      label: 'Category',
      code: 'category_name',
    },
    {
      label: 'Description',
      code: 'description',
    },
  ];

  public tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: () => {
        console.log(this);
      }
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (transaction: TransactionModel) => {
        console.log(transaction);

        this.dialog.open(TransactionDeleteModalComponent, null,
          (res) => {
            if (res) {
              this.backend.request('v1/transactions/' + transaction.id, 'DELETE').subscribe(result => {
                console.log(result);
              });
            }
          });
      }
    },
  ];

  constructor(
    private backend: BackendService,
    private categories: CategoriesService,
    private dialog: DialogService
  ) {
  }

  ngOnInit() {
  }

  public getPage = (page, pageSize) => {
    let totalCount;
    return this.backend
      .request(
        'v1/transactions',
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
          totalCount = apiResult['_meta']['totalCount'];
          return apiResult;
        }),
        map(apiResult => apiResult['items']),
        map(items => {
          items.forEach(item => {
            item['created_at'] = parseInt(item['created_at'] + `000`, 10);
            item['category_name'] = item['category']['name'];
          });
          return items;
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
