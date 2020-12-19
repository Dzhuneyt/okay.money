import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Observer} from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public loginStateChanges = new BehaviorSubject<{
    loggedIn: boolean,
    userId?: number,
  }>({
    loggedIn: false,
  });

  constructor(
    private localStorage: LocalStorage,
  ) {
  }

  public restoreUserState() {
    return new Observable(observer => {
      // fill the initial value on app boot time
      if (!this.loginStateChanges.getValue().loggedIn) {
        this.localStorage.getItem('access_token')
          .pipe(take(1))
          .subscribe(res => {
            if (res) {
              console.log('Auth token present in local storage. Restoring logged in state');
              this.setIsLoggedIn(true);
              observer.next();
              observer.complete();
              return;
            }
            console.log('Auth token not present in local storage');
            observer.next();
            observer.complete();
          });
      } else {
        observer.next();
        observer.complete();
      }
    });
  }

  public setAccessToken(key): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.localStorage.setItem('access_token', key).subscribe(() => {
        observer.next(true);
        observer.complete();
      });
    });
  }

  public setIsLoggedIn(isLoggedIn: boolean = null): void {
    switch (isLoggedIn) {
      case true:
        // Login
        this.loginStateChanges.next({
          loggedIn: true,
        });
        break;
      case false:
        // Logout
        this.localStorage.removeItem('access_token').subscribe(() => {
          this.loginStateChanges.next({
            loggedIn: false,
          });
        });
        break;
    }
  }

  public getLoginStageChanges() {
    return this.loginStateChanges;
  }
}
