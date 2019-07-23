import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Observer} from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public loginStageChanges = new BehaviorSubject<{
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
      if (!this.loginStageChanges.getValue().loggedIn) {
        this.localStorage.getItem('auth_key')
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

  public setAuthKey(key): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.localStorage.setItem('auth_key', key).subscribe(() => {
        observer.next(true);
        observer.complete();
      });
    });
  }

  public setIsLoggedIn(newValue: boolean = null): void {
    switch (newValue) {
      case true:
        // Login
        this.loginStageChanges.next({
          loggedIn: true,
        });
        break;
      case false:
        // Logout
        this.loginStageChanges.next({
          loggedIn: false,
        });
        break;
    }
  }

  public getLoginStageChanges() {
    return this.loginStageChanges;
  }
}
