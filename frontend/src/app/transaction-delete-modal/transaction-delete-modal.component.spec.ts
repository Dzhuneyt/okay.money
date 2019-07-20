import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TransactionDeleteModalComponent} from './transaction-delete-modal.component';

describe('TransactionDeleteModalComponent', () => {
  let component: TransactionDeleteModalComponent;
  let fixture: ComponentFixture<TransactionDeleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionDeleteModalComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
