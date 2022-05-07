import {Component, OnInit, ViewChild} from '@angular/core';
import {TableAction, TableColumn, TableComponent, TableGlobalAction} from '../../ui-kit/table/table.component';
import {catchError, map} from 'rxjs/operators';
import {Category} from '../../models/Category';
import {BackendService} from '../../services/backend.service';
import {DialogService} from '../../services/dialog.service';
import {SnackbarService} from '../../services/snackbar.service';
import {CategoryEditComponent} from '../category-edit/category-edit.component';
import {DeleteConfirmComponent} from '../../delete-confirm/delete-confirm.component';
import {of} from 'rxjs';
import {CategoryService} from '../category.service';
import {Title} from "@angular/platform-browser";

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

  public tableFooterActions: TableGlobalAction[] = [
    {
      label: 'Create a category',
      icon: 'add',
      onClick: () => {
        this.dialogService.open(CategoryEditComponent, {
            data: {},
            width: '700px'
          },
          (res) => {
            switch (res) {
              case true:
                // Notify other parts of the app so UI can be refreshed
                this.categoryService.changes.next();
                this.table.goToPage(this.table.currentPage);
                break;
              case false:
                this.snackbarService.error('Creating transaction failed');
                break;
            }
          });
      },
    }
  ];

  constructor(
    private backendService: BackendService,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
    private categoryService: CategoryService,
    private title: Title,
  ) {
    this.title.setTitle('Categories');
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
        }
        if (res === false) {
          this.snackbarService.error('Editing failed');
        }
      });
  }

  private openDeleteAccountDialog(category: Category) {
    this.dialogService.open(DeleteConfirmComponent, {
        data: {
          title: 'Are you sure you want to delete this category? All transactions marked with it will be deleted!',
          onConfirm: () => {
            this.categoryService.deleteCategory(category.id);
            return this.backendService.request('category/' + category.id, 'DELETE').pipe(
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
          this.snackbarService.success('Deleted');
          // Refresh the table
          this.table.goToPage(this.table.currentPage);
        } else {
          this.snackbarService.error('Deleting failed');
        }
      });
  }
}
