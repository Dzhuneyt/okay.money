import {Component, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {Observable, Observer} from 'rxjs';
import {UserService} from 'src/app/services/user.service';
import {Title} from '@angular/platform-browser';
import {filter, map} from 'rxjs/operators';
import { BackendService } from 'src/app/services/backend.service';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string;
  password: string;

  public showSpinner = false;

  constructor(
    private backendService: BackendService,
    private userService: UserService,
    private localStorage: LocalStorage,
    private snackBar: MatSnackBar,
    private snackbarService: SnackbarService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private title: Title,
  ) {
  }

  login(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.showSpinner = true;
      this.backendService
        .request('login', 'post', {}, {
          username: this.email,
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

            this.snackbarService.success('Welcome!');

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

  ngOnInit() {
    this.title.setTitle('Okay.money - Login');

    this.activatedRoute.queryParamMap
      .pipe(filter(params => params.has('credentials')))
      .pipe(map(params => JSON.parse(params.get('credentials'))))
      .subscribe(credentials => {
        this.userService.setAccessToken(credentials).subscribe(() => {
          this.userService.setIsLoggedIn(true);

          this.snackbarService.success('Welcome!');

          this.router.navigate(['/home']).then();
        });
      });
  }
}
