import {Component, OnInit, ViewChild} from '@angular/core';
import {TableAction, TableColumn, TableComponent} from "../../table/table.component";
import {map} from "rxjs/operators";
import {Category} from "../../models/Category";
import {BackendService} from "../../services/backend.service";
import {DialogService} from "../../services/dialog.service";
import {SnackbarService} from "../../services/snackbar.service";
import {CategoryEditComponent} from "../category-edit/category-edit.component";

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {

  @ViewChild(TableComponent, {static: true}) table: TableComponent;

  public displayedColumns: TableColumn[] = [
    {
      label: 'Name',
      code: 'title',
    },
  ];

  public tableActions: TableAction[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (category: Category) => this.openEditCategoryDialog(category)
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (category: Category) => this.openDeleteAccountDialog(category),
    },
  ];

  constructor(
    private backendService: BackendService,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
  ) {
  }

  ngOnInit() {
  }

  public getPage = (page, pageSize) => {

    let totalCount;
    return this.backendService
      .request(
        'category',
        'get',
        {
          page: page,
          page_size: pageSize,
          sort: '-created_at'
        }
      )
      .pipe(
        map((apiResult: Category[]) => {
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

  private openEditCategoryDialog(category: Category) {
    this.dialogService.open(CategoryEditComponent, {
        data: {
          id: category.id,
        },
        width: '700px'
      },
      (res) => {
        if (res) {
          // Refresh the table
          this.table.goToPage(this.table.currentPage);
          this.snackbarService.success('Category modified');
        } else {
          this.snackbarService.error('Editing failed');
        }
      });
  }
}
