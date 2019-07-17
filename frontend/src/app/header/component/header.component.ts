import {Component, OnInit} from '@angular/core';
import {MenuService} from '../../menu.service';
import {UserService} from 'src/app/services/user.service';
import {tap} from 'rxjs/operators';
import {Router} from "@angular/router";

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

}
