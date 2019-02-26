import {Injectable} from '@angular/core';
import {BackendService} from "./backend.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface Category {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private backend: BackendService,
  ) {
  }

  public getList(): Observable<Category[]> {
    return this.backend.request('v1/categories', 'GET')
      .pipe(
        map(items => items['items'])
      );
  }

  /**
   * Find the name of the category from the given ID
   * @param idCategory
   */
  public getName(idCategory: number) {
    return this.getList().pipe(
      map(
        categories => categories.find(
          cat => cat['id'] === idCategory
        )
      ),
      map(
        category => category['name']
      )
    )
  }
}
