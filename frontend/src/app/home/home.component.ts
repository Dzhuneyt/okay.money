import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {BackendService} from "../services/backend.service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {AddAccountComponent} from "./parts/add-account/add-account.component";
import {DialogService} from "../services/dialog.service";
import {AccountsListComponent} from "./parts/accounts-list/accounts-list.component";
import {CategoriesService} from "../services/categories.service";
import {ChartDataSets, ChartOptions} from "chart.js";

interface Account {
    id?: number;
    name: string;
    starting_balance: number;
    current_balance: number;
}

interface CategoryStats {
    id: number;
    name?: string;
    income_for_period: number;
    expense_for_period: number;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    @ViewChild(AccountsListComponent) accountListComponent;
    public doughnutChartType = 'pie';
    public chartOptions: ChartOptions = {
        responsive: true,
        tooltips: {
            enabled: true,
        },
        legend: {
            display: true,
            position: "bottom"
        },
        hover: {
            intersect: false,
            mode: "nearest"
        }
    };
    // @TODO refactor
    public statsByCategoryPeriod = 'weekly';
    private categoryInfos: CategoryStats[] = [];

    constructor(
        private backend: BackendService,
        private MatDialog: MatDialog,
        private DialogService: DialogService,
        private snackbar: MatSnackBar,
        private elementRef: ChangeDetectorRef,
        private categories: CategoriesService,
    ) {
    }

    get categoryStatsDataSets(): ChartDataSets[] {
        const expenses = this.categoryInfos.map(elem => elem.expense_for_period);
        const incomes = this.categoryInfos.map(elem => elem.income_for_period);
        return [
            {
                label: 'Expenses',
                data: expenses,
            },
            {
                label: 'Income',
                data: incomes,
            }
        ];
    }

    get categoryStatsLabels() {
        return this.categoryInfos.map(elem => elem.name ? elem.name : elem.id);
    }

    public statsPeriodChange(event) {
        console.log(event);
        // @TODO trigger API call
    }

    ngOnInit() {
        this.getStatsByCategory();
    }

    public openAddAccountModal() {
        this.DialogService.open(AddAccountComponent, {
            width: '600px'
        }, (res) => {
            this.accountListComponent.goToPage();

            this.snackbar.open('Account successfully created', null, {
                duration: 1000,
            });
        });
    }

    private getStatsByCategory() {
        this.backend.request('v1/stats/by_category').subscribe(apiResult => {
            this.categories.getList().subscribe(items => {
                this.categoryInfos = apiResult['categories'].map(cat => {
                    const foundCategory = items.find(item => {
                        return item['id'] === cat['id'];
                    });
                    cat['name'] = foundCategory['name'];
                    return cat;
                });
                this.elementRef.detectChanges();
            });
        });
    }
}
