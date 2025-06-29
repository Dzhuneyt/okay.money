import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BackendService} from './backend.service';
import {Account} from 'src/app/models/account.model';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  public changes = new EventEmitter();

  constructor(
    private backend: BackendService,
  ) {
  }

  getList(): Observable<Account[]> {
    return this.backend.request('account', 'GET').pipe(map(res => res.accounts));
  }

  getSingle(id: number): Observable<Account> {
    return this.backend.request(`account/${id}`, 'GET');
  }

  updateSingle(id: number, payload: {}) {
    return this.backend.request(`account/${id}`, 'PUT', {}, payload);
  }

  createSingle(payload: {}) {
    return this.backend.request('account', 'POST', {}, payload);
  }
}
