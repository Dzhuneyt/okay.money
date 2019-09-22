import {Component, OnInit} from '@angular/core';
import {MenuService} from '../../menu.service';
import {UserService} from 'src/app/services/user.service';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TransactionEditComponent} from 'src/app/transaction-edit/transaction-edit.component';
import {DialogService} from 'src/app/services/dialog.service';
import {MatSnackBar} from '@angular/material';
import {TransactionService} from 'src/app/services/transaction.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public isLoggedIn = false;

  constructor(
    private menuService: MenuService,
    private userService: UserService,
    private router: Router,
    private dialog: DialogService,
    private snackbar: MatSnackBar,
    private transaction: TransactionService,
  ) {
  }

  ngOnInit() {
    this.userService.loginStageChanges.pipe(
      tap(val => {
        console.log(val);
      }),
    ).subscribe(data => (this.isLoggedIn = data.loggedIn));
  }

  public toggleMenu() {
    this.menuService.toggle();
  }

  public logout() {
    this.userService.setIsLoggedIn(false);
    this.router.navigate(['/login']);
  }

  public createTransaction() {
    this.dialog.open(TransactionEditComponent, {
        data: {},
        width: '700px'
      },
      (res) => {
        if (res) {
          this.transaction.changes.next();
        } else {
          this.snackbar.open('Creating transaction failed');
        }
      });
  }
}
