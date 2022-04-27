import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MenuItem, MenuService} from '../../menu.service';
import {UserService} from 'src/app/services/user.service';
import {filter, take} from 'rxjs/operators';
import {TransactionEditComponent} from '../../transaction-edit/transaction-edit.component';
import {DialogService} from '../../services/dialog.service';
import {SnackbarService} from '../../services/snackbar.service';
import {TransactionService} from '../../services/transaction.service';
import {StorageMap} from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public menuItems: MenuItem[];

  constructor(
    private menuService: MenuService,
    private dialog: DialogService,
    private snackbarService: SnackbarService,
    private transactionService: TransactionService,
    public userService: UserService,
    public ref: ChangeDetectorRef,
    private storage: StorageMap,
  ) {
  }

  ngOnInit() {
    this.menuService.items.subscribe(menuItems => {
      this.menuItems = menuItems;
      this.ref.detectChanges();
    });

    this.userService.loginStateChanges.subscribe(value => {
      const {loggedIn} = value;
      if (loggedIn) {
        this.menuService.items.next([
          {
            label: 'Create a transaction',
            matIcon: 'add',
            onClick: () => {
              this.dialog.open(TransactionEditComponent, {
                  data: {},
                  width: '700px'
                },
                (res) => {
                  if (res) {
                    this.transactionService.changes.next();
                  } else if (res === false) {
                    this.snackbarService.error('Creating failed');
                  }
                });
            },
          }
        ]);

        // Restore menu open/closed state after a page refresh or after a login
        this.storage.get('menu_open').pipe(
          take(1),
          filter(open => open === true), // only if sidebar was previously open
          filter(() => !this.menuService.isOpened) // only if sidebar is NOT currently open
        ).subscribe(() => {
          this.menuService.toggle(); // open sidebar
        });
      }
    });
  }

  public toggleMenu() {
    this.menuService.toggle();

    // Store the current sidebar open/close state in local storage, so it can be restored after a page refresh
    this.storage.set('menu_open', this.menuService.isOpened).subscribe();
  }

  getHeaderFxFlex() {
    return this.userService.getLoginStageChanges().value.loggedIn
      ? '1 1 auto'
      : '0 1 1024px';
  }
}
