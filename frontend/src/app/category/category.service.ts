import {Injectable} from '@angular/core';
import {BackendService} from "../services/backend.service";
import {catchError} from "rxjs/operators";
import {BehaviorSubject, Observable, of} from "rxjs";
import {Category} from "../models/Category";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  changes = new BehaviorSubject<void>(null);

  constructor(
    private backend: BackendService,
  ) {
  }

  deleteCategory(id: string) {
    return this.backend.request('category/' + id, 'DELETE').pipe(
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  public getSingle(id: number): Observable<Category> {
    return this.backend.request('category/' + id, 'GET');
  }

  createSingle(payload: { title: any }) {
    return of();
    // @TODO
  }

  updateSingle(id, payload: { title: any }) {
    return of();
    // @TODO
  }
}
