import {Component, OnInit} from '@angular/core';
import {UserService} from "../services/user.service";
import {Router} from "@angular/router";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  logout() {

    this.userService.setIsLoggedIn(false);
    // window.location.reload(); // @TODO figure out why the below doesn't work

    // Wait for logout event
    this.userService.loginStateChanges
      .pipe(filter(value => !value.loggedIn))
      .subscribe(value => {
        this.router.navigate(['/login']);
      });

    const absoluteUrl = window.location.origin + this.router.createUrlTree(['/login']);
    console.log(absoluteUrl);
  }
}
