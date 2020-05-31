import {EventEmitter, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BackendService} from './backend.service';
import {map} from 'rxjs/operators';
import {Account} from 'src/app/models/account.model';


@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  public changes = new EventEmitter();

  constructor(
    private backend: BackendService,
  ) {
  }

  public getList(): Observable<Account[]> {
    return this.backend.request('account', 'GET');
  }

  public getSingle(id: number): Observable<Account> {
    return this.backend.request('account/' + id, 'GET');
  }

  updateSingle(id: number, payload: {}) {
    return this.backend.request('account/' + id, 'PUT', {}, payload);
  }

  createSingle(payload: {}) {
    return this.backend.request('account', 'POST', {}, payload);
  }
}
