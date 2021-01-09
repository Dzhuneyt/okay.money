import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {BehaviorSubject, EMPTY, Observable, Observer, ReplaySubject} from 'rxjs';
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

  public isLoading = false;

  public registrationTokenInfo: {
    id: string,
    email: string,
  };

  public form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  public formWithToken = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.min(6)]),
    passwordRepeat: new FormControl('', [Validators.required, Validators.min(6)]),
  });

  constructor(
    private backendService: BackendService,
    private userService: UserService,
    private localStorage: LocalStorage,
    private snackbar: MatSnackBar,
    private snackbarService: SnackbarService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef,
  ) {
  }

  public hasConfirmToken(): boolean {
    return this.activatedRoute.snapshot.queryParamMap.has('token');
  }

  ngOnInit() {

    // Whenever the current Component is visited with the ?token=xxx query param
    this.activatedRoute.queryParamMap.pipe(
      filter(value => value.has('token')),
      map(value => value.get('token')),
    )
      .subscribe(token => {
        this.backendService
          .request('register/registrationToken', 'GET', {token})
          .pipe(
            catchError(err => {
              this.snackbarService.error('Invalid registration link. It may be expired');
              // Redirect to registration page so the user can re-register
              this.router.navigate(['/register']);
              this.ref.detectChanges();
              // Prevent further code execution
              return EMPTY;
            })
          )
          .subscribe((value: {
            id: string,
            email: string,
          }) => {
            this.registrationTokenInfo = {
              id: value.id,
              email: value.email,
            };
          });
      });
  }

  register(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.isLoading = true;
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
            this.isLoading = false;
            observer.next(false);
            observer.complete();
            console.log(err.error);
            return EMPTY;
          }),
        )
        .subscribe(result => {
          console.log(result);
          console.log('Register initiation success');
          this.isLoading = false;

          this.snackbarService.success('Registered successfully. Please check your email for a confirmation link.');

          this.router.navigate(['/home']);

          observer.next(true);
          observer.complete();
        }, (result) => {
          console.error('Registration failed with errors', result);
          this.snackbarService.error(`Registration failed: ${result.error}`);
          this.isLoading = false;

          observer.next(false);
          observer.complete();
        });
    });
  }

  confirmRegistration() {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.isLoading = true;
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
            this.isLoading = false;
            observer.next(false);
            observer.complete();
            console.log(err.error);
            return EMPTY;
          }),
        )
        .subscribe(result => {
          console.log(result);
          console.log('Register success');
          this.isLoading = false;

          this.snackbarService.success('Registered successfully');

          this.router.navigate(['/home']);

          observer.next(true);
          observer.complete();
        }, (result) => {
          console.error('Registration failed with errors', result);
          this.snackbarService.error(`Registration failed: ${result.error}`);
          this.isLoading = false;

          observer.next(false);
          observer.complete();
        });
    });
  }

}
