import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable, Observer} from 'rxjs';
import {LocalStorage} from "@ngx-pwa/local-storage";

@Injectable({
    providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
    constructor(
        private localStorage: LocalStorage
    ) {
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> {

        return new Observable<boolean>((observer: Observer<boolean>) => {
            this.localStorage.getItem('auth_key').subscribe(item => {
                if (!item) {
                    observer.next(false);
                } else {
                    observer.next(true);
                }
                observer.complete();
            });
        });
    }
}
