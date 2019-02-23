import {Component, OnInit} from '@angular/core';
import {MenuService} from "../../menu.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    constructor(
        private menuService: MenuService,
    ) {
    }

    ngOnInit() {
    }

    public toggleMenu() {
        this.menuService.toggle();
    }

}
