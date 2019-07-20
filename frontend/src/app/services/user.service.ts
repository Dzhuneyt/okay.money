import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

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

  constructor() {
    // @TODO fill the initial value on app boot time
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
}
