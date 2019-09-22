import {inject, TestBed} from '@angular/core/testing';

import {LoggedInGuard} from './logged-in.guard';
import {from, Observable} from "rxjs";
import {LocalStorage} from "@ngx-pwa/local-storage";

describe('LoggedInGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LoggedInGuard,
                LocalStorage,
            ]
        });
    });

    it('should create', inject([LoggedInGuard], (guard: LoggedInGuard) => {
        expect(guard).toBeTruthy();
        let observable = guard.canActivate(null, null);
        expect(observable instanceof Observable)
            .toBeTruthy();
    }));

    it('should allow when token is present in local storage', (done: Function) => {
        inject([LoggedInGuard, LocalStorage], (guard: LoggedInGuard, localStorage: LocalStorage) => {
            spyOn(localStorage, 'getItem').and.returnValue(from([true]));

            let observable = guard.canActivate(null, null);
            observable.subscribe((result) => {
                expect(result).toBeTruthy("Token exists in local storage, but guard did not allow");
                done();
            });
        })();
    });
    it('should not allow when token is not present in local storage', (done: Function) => {
        inject([LoggedInGuard, LocalStorage], (guard: LoggedInGuard, localStorage: LocalStorage) => {
            spyOn(localStorage, 'getItem').and.returnValue(from([false]));

            let observable = guard.canActivate(null, null);
            observable.subscribe((result) => {
                expect(result).toBeFalsy("Token not exists in local storage but guard allowed access");
                done();
            });
        })();
    });
});
