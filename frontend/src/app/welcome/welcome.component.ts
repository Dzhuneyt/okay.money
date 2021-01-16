import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuService} from "../menu.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-welcome-component',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  constructor(
    private menuService: MenuService,
    private titleService: Title,
  ) {
  }

  ngOnInit(): void {
    this.titleService.setTitle('Personal Finance - Okay.money');
  }

  ngOnDestroy() {
  }

}
