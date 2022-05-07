import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {UserService} from 'src/app/services/user.service';
import {Router} from '@angular/router';
import {CookieService} from './cookie.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  public appReady = false;

  constructor(
    public menuService: MenuService,
    public user: UserService,
    public router: Router,
    public cookieService: CookieService,
  ) {

    this.user.restoreUserState().subscribe(() => {
      this.appReady = true;
    });
  }

  ngOnInit() {
    this.user.loginStateChanges.subscribe(value => {
      if (!value.loggedIn) {
        // On logout, close the sidebar
        if (this.menuService.isOpened) {
          this.menuService.isOpened = false;
        }
      }
    });
  }

  shouldShowHeader() {
    return true;
  }
}
