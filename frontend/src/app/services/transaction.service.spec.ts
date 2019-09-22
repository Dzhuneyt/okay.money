import {TestBed} from '@angular/core/testing';

import {TransactionService} from 'src/app/services/transaction.service';

describe('TransactionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransactionService = TestBed.get(TransactionService);
    expect(service).toBeTruthy();
  });
});
