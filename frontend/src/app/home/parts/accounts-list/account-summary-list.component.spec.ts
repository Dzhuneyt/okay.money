import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {AccountSummaryListComponent} from 'src/app/home/parts/accounts-list/account-summary-list.component';

describe('AccountsListComponent', () => {
    let component: AccountSummaryListComponent;
    let fixture: ComponentFixture<AccountSummaryListComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [AccountSummaryListComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountSummaryListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
