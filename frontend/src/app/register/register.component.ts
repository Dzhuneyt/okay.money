import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {EMPTY, Observable, Observer} from 'rxjs';
import {BackendService} from '../services/backend.service';
import {UserService} from '../services/user.service';
import {catchError} from 'rxjs/operators';
import {SnackbarService} from '../services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public showSpinner = false;

  public form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private backendService: BackendService,
    private userService: UserService,
    private localStorage: LocalStorage,
    private snackar: MatSnackBar,
    private snackbarService: SnackbarService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  register(): Observable<boolean> {
    return new Observable<boolean>((observer: Observer<boolean>) => {
      this.showSpinner = true;
      this.backendService
        .request('register', 'post', {}, {
          username: this.form.controls['username'].value,
          password: this.form.controls['password'].value,
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
          this.snackar.open(`Registration failed: ${result.error}`, null, {
            duration: 5000,
          });
          this.showSpinner = false;

          observer.next(false);
          observer.complete();
        });
    });
  }

}
