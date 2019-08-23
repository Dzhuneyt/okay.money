import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {BackendService} from "./backend.service";
import {map} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(
    private backend: BackendService,
  ) {
  }

  public getList(): Observable<Account[]> {
    return this.backend.request('v1/accounts', 'GET')
      .pipe(
        map(items => items['items'])
      );
  }
}
