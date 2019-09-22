import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, Observer} from 'rxjs';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {UserService} from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AnonymousUserGuard implements CanActivate {
  constructor(
    private localStorage: LocalStorage,
    private router: Router,
    private user: UserService,
  ) {

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.user.restoreUserState().subscribe(() => {
        if (this.user.loginStageChanges.getValue().loggedIn) {
          // Don't allow logged in users to this route
          // This route is only for anonymous users
          observer.next(false);
          this.router.navigate(['/home']);
        } else {
          observer.next(true);
        }
        observer.complete();
      });


    });
  }

}
