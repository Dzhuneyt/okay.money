import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, Observer} from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {UserService} from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
  constructor(
    private localStorage: LocalStorage,
    private router: Router,
    private user: UserService,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.user.restoreUserState().subscribe(() => {
        // Don't allow anonymous users here
        // This route allows only logged in users
        if (this.user.loginStateChanges.getValue().loggedIn) {
          observer.next(true);
        } else {
          observer.next(false);
          this.router.navigate(['/login']);
        }
        observer.complete();
      });
    });
  }
}
