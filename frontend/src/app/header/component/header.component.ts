import {Component, OnInit} from '@angular/core';
import {MenuItem, MenuService} from '../../menu.service';
import {UserService} from 'src/app/services/user.service';
import {tap} from 'rxjs/operators';

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
    public userService: UserService,
  ) {
  }

  ngOnInit() {
    this.menuService.items.subscribe(menuItems => this.menuItems = menuItems);
  }

  public toggleMenu() {
    this.menuService.toggle();
  }

}
