import {Component} from '@angular/core';
import {BackendService} from '../services/backend.service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable, Observer} from 'rxjs';
import {Router} from '@angular/router';
import {UserService} from 'src/app/services/user.service';
import {SnackbarService} from '../services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username: string;
  password: string;

  public showSpinner = false;

  constructor(
    private backendService: BackendService,
    private userService: UserService,
    private localStorage: LocalStorage,
    private snackBar: MatSnackBar,
    private snackbarService: SnackbarService,
    private router: Router,
  ) {
  }

  login(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.showSpinner = true;
      this.backendService
        .request('login', 'post', {}, {
          username: this.username,
          password: this.password,
        })
        .subscribe(result => {
          console.log(result);
          console.log('Login success');
          this.showSpinner = false;

          if (result.hasOwnProperty('errors')) {
            console.error('Login failed with errors', result);
            this.snackbarService.error('Login failed');

            observer.next(false);
            observer.complete();
            return;
          }

          this.userService.setAccessToken(result).subscribe(() => {
            this.userService.setIsLoggedIn(true);

            this.snackbarService.success('Login successful');

            this.router.navigate(['/home']);

            observer.next(true);
            observer.complete();
          });
        }, (result) => {
          console.error('Login failed with errors', result);
          this.snackbarService.error('Login failed');
          this.showSpinner = false;

          observer.next(false);
          observer.complete();
        });
    });
  }

}
