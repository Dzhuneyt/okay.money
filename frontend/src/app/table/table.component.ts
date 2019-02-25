import {Component, Input, OnInit} from '@angular/core';
import {from, Observable} from "rxjs";
import {take} from "rxjs/operators";

export interface TableColumn {
  code: string;
  label: string;
}

export interface TablePaginationResponse {
  items: any[],
  totalCount: number,
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  public currentPageItems = [];

  @Input() displayedColumns: TableColumn[] = [];
  @Input() pageSize: number = 20;

  public totalCount = 0;

  public currentPage = 0;

  constructor() {
  }

  get displayedColumnCodes() {
    const items: string[] = [];
    this.displayedColumns.forEach(tableColumn => {
      items.push(tableColumn.code);
    });
    return items;
  }

  @Input() pagination: (page: number, pageSize: number) => Observable<TablePaginationResponse> = (pageToFetch: number) => {
    console.log('Fetching page ' + pageToFetch + '. Not implemented');
    return from([{
      totalCount: 0,
      items: []
    }]);
  };

  ngOnInit() {
    this.goToPage(0);
  }

  public goToPage(page: number) {
    this.pagination(page, this.pageSize)
      .pipe(take(1))
      .subscribe((res: TablePaginationResponse) => {
        this.currentPageItems = res.items;
        this.totalCount = res.totalCount;
        this.currentPage = page;
      });
  }
}
