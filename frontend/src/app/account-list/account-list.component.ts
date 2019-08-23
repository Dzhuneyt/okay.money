import {Component, OnInit, ViewChild} from '@angular/core';
import {TableAction, TableColumn, TableComponent} from 'src/app/table/table.component';
import {TransactionModel} from 'src/app/models/transaction.model';
import {Account} from 'src/app/models/account.model';
import {map} from 'rxjs/operators';
import {BackendService} from 'src/app/services/backend.service';

const columns = [
  {
    label: 'Account Name',
    code: 'name',
    renderer: (element: Account) => {
      return element.name;
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

  public tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (transaction: Account) => {
        alert('todo');
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
  @ViewChild(TableComponent) table: TableComponent;
  public pageSize = 10;

  constructor(
    private backend: BackendService,
  ) {
  }

  ngOnInit() {
  }

  public getPage = (page, pageSize) => {
    let totalCount;
    return this.backend
      .request(
        'v1/accounts',
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
            // item['created_at'] = parseInt(item['created_at'] + `000`, 10);
            // item['category_name'] = item['category']['name'];
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
