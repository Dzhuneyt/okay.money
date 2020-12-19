import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';

// declared in frontend/src/styles.scss
const PANEL_CLASS_GREEN = 'green-bg';
const PANEL_CLASS_RED = 'red-bg';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackbar: MatSnackBar) {
  }

  success(msg: string) {
    this.snackbar.open(msg, null, {
      panelClass: PANEL_CLASS_GREEN,
      duration: 3500,
    });
  }

  error(msg: string) {
    this.snackbar.open(msg, null, {
      panelClass: PANEL_CLASS_RED,
      duration: 3500,
    });
  }
}
