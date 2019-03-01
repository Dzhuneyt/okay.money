import {Component, OnInit} from '@angular/core';
import {TableColumn, TableColumnType} from "../../../table/table.component";
import {concatMap, map} from "rxjs/operators";
import {BackendService} from "../../../services/backend.service";
import {CategoriesService} from "../../../services/categories.service";
import {forkJoin, Observable} from "rxjs";

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

  constructor(
    private backend: BackendService,
    private categories: CategoriesService,
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
        concatMap(items => {
          return Observable.create(observer => {
            const observables = [];
            items.forEach(item => {
              // Convert ot JS suitable date object
              item['created_at'] = parseInt(item['created_at'] + `000`, 10);

              observables.push(this.categories
                .getName(item['category_id']).pipe(map(a => {
                  item['category_name'] = a;
                })));
            });

            return forkJoin(observables).subscribe(() => {
              observer.next(items);
              observer.complete();
            })
          });
        }),
        map(items => {
          return {
            items: items,
            totalCount: totalCount
          }
        })
      )

  };

}
