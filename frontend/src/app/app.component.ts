import {Component} from '@angular/core';
import {MenuService} from "./menu.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'frontend';

    constructor(
        public menuService: MenuService,
    ) {

    }
}
