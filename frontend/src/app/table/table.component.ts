import {Component, Input, OnInit} from '@angular/core';
import {from, Observable} from 'rxjs';
import {take} from 'rxjs/operators';

export enum TableColumnType {
  standard = 'standard', // default
  dateTime = 'datetime',
  function = 'function',
}

export interface TableColumn {
  code: string;
  label: string;
  type?: TableColumnType;

  // Required if type=function
  renderer?: (element: any) => any;
}

export interface TablePaginationResponse {
  items: any[];
  totalCount: number;
}

export interface TableAction {
  label: string;
  icon: string;
  onClick: Function;
}

export interface TableGlobalAction extends TableAction {
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  public currentPageItems = [];

  @Input() displayedColumns: TableColumn[] = [];
  @Input() pageSize = 20;
  @Input() actions: TableAction[] = [];
  public totalCount = 0;
  public currentPage = 0;

  public isLoading = true;
  @Input() footerActions: TableGlobalAction[] = [];

  constructor() {
  }

  get displayedColumnCodes() {
    const items: string[] = [];
    this.displayedColumns.forEach(tableColumn => {
      items.push(tableColumn.code);
    });

    if (this.actions.length > 0) {
      items.push('actions');
    }
    return items;
  }

  @Input() pagination: (page: number, pageSize: number) => Observable<TablePaginationResponse> = (pageToFetch: number) => {
    console.log('Fetching page ' + pageToFetch + '. Not implemented');
    return from([{
      totalCount: 0,
      items: []
    }]);
  }

  ngOnInit() {
    this.goToPage(0);
  }

  public goToPage(page: number) {
    this.isLoading = true;
    this.pagination(page, this.pageSize)
      .pipe(take(1))
      .subscribe((res: TablePaginationResponse) => {
        this.currentPageItems = res.items;
        this.totalCount = res.totalCount;
        this.currentPage = page;
        this.isLoading = false;
      });
  }

  shouldShowPagination(): boolean {
    if (this.isLoading) {
      // Hide pagination temporarily while page results are loading
      return false;
    }
    if (this.currentPage > 0) {
      // When the table is currently moved to page 2 or more - always show pagination
      // This is to give possibility to go back to previous pages
      return true;
    }
    // On first page, only show pagination if there are some rows shown
    // The pagination in this case will have the next/prev buttons disabled
    // anyway but it displays useful information like "showing 1-18 of 18 elements"
    return this.currentPageItems.length > 0;
  }
}
