import {Injectable} from '@angular/core';
import {BackendService} from 'src/app/services/backend.service';
import {Observable} from 'rxjs';
import {TransactionModel} from 'src/app/models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(
    private backend: BackendService,
  ) {
  }

  public getSingle(id: number): Observable<TransactionModel> {
    return this.backend.request('v1/transactions/' + id, 'GET');
  }
}
