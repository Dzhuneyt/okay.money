import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {BackendService} from "./backend.service";
import {map} from "rxjs/operators";

export interface Account {
  id: number;
  name: string;
  starting_balance: number;
  current_balance: number;
}

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
