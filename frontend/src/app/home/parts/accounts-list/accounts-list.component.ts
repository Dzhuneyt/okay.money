import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from "../../../services/backend.service";
import {map, take} from "rxjs/operators";
import {TableColumn, TableComponent} from "../../../table/table.component";

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit {

  @ViewChild(TableComponent) table: TableComponent;

  public displayedColumns: TableColumn[] = [
    {
      label: 'Name',
      code: 'name',
    },
    {
      label: 'Current balance',
      code: 'current_balance',
    }
  ];

  constructor(
    private backend: BackendService,
  ) {
  }

  public goToPage(page?: number) {
    this.table.goToPage(page === null ? this.table.currentPage : page);
  }

  public rowFetchers = (page: number, pageSize: number) => {
    return this.backend
      .request(
        'v1/accounts',
        'get',
        {
          page: page,
          page_size: pageSize,
        }
      )
      .pipe(
        take(1),
        map(result => {
          return {
            items: result['items'],
            totalCount: result['_meta']['totalCount']
          }
        })
      );
  };

  ngOnInit() {

  }

}
