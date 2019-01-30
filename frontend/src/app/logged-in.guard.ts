import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {LocalStorage} from "@ngx-pwa/local-storage";

@Injectable({
    providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
    constructor(private localStorage: LocalStorage) {
    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return new Promise((resolve, reject) => {
            this.localStorage.getItem('auth_key').subscribe(item => {
                if (!item) {
                    reject();
                    console.error('No auth key found in local storage. Guard rejects');
                }
                resolve();
            });
        });
    }
}
