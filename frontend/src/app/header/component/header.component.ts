import {Component, OnInit} from '@angular/core';
import {MenuItem, MenuService} from '../../menu.service';
import {UserService} from 'src/app/services/user.service';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TransactionEditComponent} from 'src/app/transaction-edit/transaction-edit.component';
import {DialogService} from 'src/app/services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {TransactionService} from 'src/app/services/transaction.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public isLoggedIn = false;
  public menuItems: MenuItem[];

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
    this.userService.loginStateChanges.pipe(
      tap(state => {
        console.log(state);
      }),
    ).subscribe(data => (this.isLoggedIn = data.loggedIn));

    this.menuService.items.subscribe(menuItems => this.menuItems = menuItems);
  }

  public toggleMenu() {
    this.menuService.toggle();
  }

  public logout() {
    this.userService.setIsLoggedIn(false);
    window.location.reload(); // @TODO figure out why the below doesn't work
    this.router.navigate(['/login']);

    const absoluteUrl = window.location.origin + this.router.createUrlTree(['/login']);
    console.log(absoluteUrl);
  }

  /**
   * @deprecated
   */
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
