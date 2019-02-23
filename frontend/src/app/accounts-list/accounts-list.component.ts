import {Component, OnInit} from '@angular/core';
import {BackendService} from "../backend.service";
import {map, take} from "rxjs/operators";
import {TableColumn} from "../table/table.component";

@Component({
    selector: 'app-accounts-list',
    templateUrl: './accounts-list.component.html',
    styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit {

    public displayedColumns: TableColumn[] = [
        {
            label: 'Name',
            code: 'name',
        },
        {
            label: 'Current balance',
            code: 'current_balance',
        }
    ];

    constructor(
        private backend: BackendService,
    ) {
    }

    public rowFetchers = (page: number, pageSize: number) => {
        return this.backend
            .request(
                'v1/accounts',
                'get',
                {
                    page: page,
                    page_size: pageSize,
                }
            )
            .pipe(
                take(1),
                map(result => {
                    return {
                        items: result['items'],
                        totalCount: result['_meta']['totalCount']
                    }
                })
            );
    };

    ngOnInit() {

    }

}
