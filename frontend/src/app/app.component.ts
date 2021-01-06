import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {UserService} from "src/app/services/user.service";
import {ActivatedRoute, Router} from "@angular/router";

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
    private route: ActivatedRoute,
  ) {

    this.user.restoreUserState().subscribe(res => {
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
    if (this.user.loginStateChanges.value.loggedIn) {
      return true;
    }
    if (this.router.url === '/home') {
      return false;
    }
    return true;
  }
}
