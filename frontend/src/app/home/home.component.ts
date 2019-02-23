import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";

interface Account {
    id?: number;
    name: string;
    starting_balance: number;
    current_balance: number;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    constructor(
        private backend: BackendService,
    ) {
    }

    ngOnInit() {

    }

}
