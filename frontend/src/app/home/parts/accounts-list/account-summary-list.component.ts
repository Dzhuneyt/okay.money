import {Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from "../../../services/backend.service";
import {map, take} from "rxjs/operators";
import {TableColumn, TableComponent} from "../../../table/table.component";

@Component({
  selector: 'app-accounts-list',
  templateUrl: './account-summary-list.component.html',
  styleUrls: ['./account-summary-list.component.scss']
})
export class AccountSummaryListComponent implements OnInit {

  @ViewChild(TableComponent, {static: true}) table: TableComponent;

  public displayedColumns: TableColumn[] = [
    {
      label: 'Name',
      code: 'title',
    },
    {
      label: 'Balance',
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
        'account',
        'get',
        {
          page: page,
          page_size: pageSize,
        }
      )
      .pipe(
        take(1),
        map((result: Account[]) => {
          return {
            items: result,
            totalCount: result.length,
          };
        })
      );
  }

  ngOnInit() {

  }

}
