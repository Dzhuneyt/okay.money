import {Injectable} from '@angular/core';
import {BackendService} from "./backend.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface Category {
  id: number;
  title: string;
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
    return this.backend.request('category', 'GET');
  }

  /**
   * Find the name of the category from the given ID
   */
  public getName(idCategory: number) {
    return this.backend.request('v1/categories/' + idCategory, 'GET').pipe(
      map(
        category => category['name']
      )
    );
  }
}
