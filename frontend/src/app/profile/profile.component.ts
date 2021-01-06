import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BackendService} from 'src/app/services/backend.service';
import {SnackbarService} from '../services/snackbar.service';

export function samePasswordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const pass = control.get('new_password').value;
    const confirmPass = control.get('new_password_repeat').value;

    if (pass === confirmPass) {
      control.get('new_password_repeat').setErrors(null);
    } else {
      control.get('new_password_repeat').setErrors({repeatPasswordMismatch: true});
    }
    return null;
  };
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public isLoading = true;

  public form = new FormGroup({
    email: new FormControl({
      value: null, disabled: true,
    }, [Validators.email]),
    firstname: new FormControl(null, []),
    lastname: new FormControl(null, []),
    old_password: new FormControl(null, []),
    new_password: new FormControl(null, []),
    new_password_repeat: new FormControl(null, []),
  }, {
    validators: [samePasswordValidator()],
    updateOn: 'change',
  });

  constructor(
    private backend: BackendService,
    private snackbar: MatSnackBar,
    private snackbarService: SnackbarService,
  ) {
  }

  ngOnInit() {
    this.resetForm();
  }

  save() {
    this.isLoading = true;
    const payload = {
      old_password: this.form.get('old_password').value,
      new_password: this.form.get('new_password').value,
      firstname: this.form.get('firstname').value,
      lastname: this.form.get('lastname').value,
    };
    this.backend.request('user/profile', 'PUT', {}, payload).subscribe(res => {
      this.isLoading = false;
      this.snackbarService.success('Profile updated');
      this.resetForm();
    }, error => {
      console.log(error);
      this.snackbarService.error(error.error.message);
    });
  }

  private resetForm() {
    this.isLoading = true;
    this.backend.request('user/profile', 'GET').subscribe(res => {
      this.form.controls['email'].setValue(res.email);
      this.form.controls['firstname'].setValue(res.firstname);
      this.form.controls['lastname'].setValue(res.lastname);
      this.isLoading = false;
    });
  }

}
