import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";
import {take} from "rxjs/operators";

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
    public items: Account[] = [];

    constructor(
        private backend: BackendService,
    ) {
    }

    ngOnInit() {
        this.backend
            .request('v1/accounts', 'get')
            .pipe(take(1))
            .subscribe(result => {
                this.items = result['items'];
            });
    }

}
