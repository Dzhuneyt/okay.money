import {EventEmitter, Injectable} from '@angular/core';
import {BackendService} from 'src/app/services/backend.service';
import {Observable} from 'rxjs';
import {TransactionModel} from 'src/app/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  public changes = new EventEmitter();

  constructor(
    private backend: BackendService,
  ) {
  }

  public getSingle(id: number): Observable<TransactionModel> {
    return this.backend.request('v1/transactions/' + id, 'GET');
  }

  updateSingle(id: number, payload: {}) {
    return this.backend.request('v1/transactions/' + id, 'PUT', {}, payload);
  }

  createSingle(payload: {}) {
    return this.backend.request('v1/transactions', 'POST', {}, payload);
  }
}
