import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {EMPTY, Observable, Observer} from 'rxjs';
import {BackendService} from '../services/backend.service';
import {UserService} from '../services/user.service';
import {catchError, filter, map} from 'rxjs/operators';
import {SnackbarService} from '../services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public showSpinner = false;

  /**
   * On registration user receives a confirmation email with link + token query param
   * When clicked, user lands on this component, with this variable populated
   */
  public token$ = this.activatedRoute.queryParamMap.pipe(
    filter(value => value.has('token')),
    map(value => value.get('token')),
  );

  public form = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });

  public formWithToken = new FormGroup({
    password: new FormControl('', [Validators.required]),
    passwordRepeat: new FormControl('', [Validators.required]),
  });

  constructor(
    private backendService: BackendService,
    private userService: UserService,
    private localStorage: LocalStorage,
    private snackbar: MatSnackBar,
    private snackbarService: SnackbarService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  ngOnInit() {
  }

  register(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.showSpinner = true;
      this.backendService
        .request('register', 'post', {}, {
          email: this.form.controls['email'].value,
        })
        .pipe(
          catchError(err => {
            this.snackbarService.error(
              err.error.message
                ? err.error.message
                : JSON.stringify(err.error)
            );
            this.showSpinner = false;
            observer.next(false);
            observer.complete();
            console.log(err.error);
            return EMPTY;
          }),
        )
        .subscribe(result => {
          console.log(result);
          console.log('Register initiation success');
          this.showSpinner = false;

          this.snackbarService.success('Registered successfully. Please check your email for a confirmation link.');

          this.router.navigate(['/home']);

          observer.next(true);
          observer.complete();
        }, (result) => {
          console.error('Registration failed with errors', result);
          this.snackbarService.error(`Registration failed: ${result.error}`);
          this.showSpinner = false;

          observer.next(false);
          observer.complete();
        });
    });
  }

  confirmRegistration() {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.showSpinner = true;
      this.backendService
        .request('register/confirm', 'post', {}, {
          token: this.activatedRoute.snapshot.queryParams['token'],
          password: this.formWithToken.get('password').value,
        })
        .pipe(
          catchError(err => {
            this.snackbarService.error(
              err.error.message
                ? err.error.message
                : JSON.stringify(err.error)
            );
            this.showSpinner = false;
            observer.next(false);
            observer.complete();
            console.log(err.error);
            return EMPTY;
          }),
        )
        .subscribe(result => {
          console.log(result);
          console.log('Register success');
          this.showSpinner = false;

          this.snackbarService.success('Registered successfully');

          this.router.navigate(['/home']);

          observer.next(true);
          observer.complete();
        }, (result) => {
          console.error('Registration failed with errors', result);
          this.snackbarService.error(`Registration failed: ${result.error}`);
          this.showSpinner = false;

          observer.next(false);
          observer.complete();
        });
    });
  }

}
