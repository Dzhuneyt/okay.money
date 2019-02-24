import {Component, OnInit} from '@angular/core';
import {TableColumn} from "../../../table/table.component";
import {from} from "rxjs";

@Component({
    selector: 'app-transaction-list',
    templateUrl: './transaction-list.component.html',
    styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {

    public displayedColumns: TableColumn[] = [
        {
            label: 'Amount',
            code: 'sum',
        },
        {
            label: 'Category',
            code: 'category',
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

    public getPage = (n1, n2) => {
        return from([
            {
                items: [
                    {sum: 33.33, category: 'Random'}
                ],
                totalCount: 100,
            }
        ]);
    };

}
