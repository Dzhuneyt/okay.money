import {Component, OnInit} from '@angular/core';
import {MenuService} from './menu.service';
import {UserService} from "src/app/services/user.service";

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
    private user: UserService,
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
          this.menuService.toggle();
        }
      }
    });
  }
}
