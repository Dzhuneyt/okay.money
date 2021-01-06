import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuService} from "../menu.service";

@Component({
  selector: 'app-welcome-component',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  constructor(
    private menuService: MenuService,
  ) {
  }

  ngOnInit(): void {
    this.menuService.headerVisible.next(false);
  }

  ngOnDestroy() {
    this.menuService.headerVisible.next(true);
  }

}
