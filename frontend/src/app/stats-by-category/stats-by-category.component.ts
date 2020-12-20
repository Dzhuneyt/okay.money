import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChartOptions} from 'chart.js';
import {BackendService} from 'src/app/services/backend.service';
import {CategoriesService} from 'src/app/services/categories.service';

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

const chartOptions: ChartOptions = {
  responsive: true,
  tooltips: {
    enabled: true,
  },
  legend: {
    display: true,
    position: 'right',
  },
  hover: {
    intersect: false,
    mode: 'nearest'
  },
};

@Component({
  selector: 'app-stats-by-category',
  templateUrl: './stats-by-category.component.html',
  styleUrls: ['./stats-by-category.component.scss']
})
export class StatsByCategoryComponent implements OnInit {

  public isLoading = true;

  /**
   * Holds an array of datasets for both charts
   * See https://valor-software.com/ng2-charts/ and https://www.chartjs.org/docs/latest/
   */
  public dataSets = {
    income: [],
    expenses: [],
  };

  // Static param
  public readonly chartOptions = chartOptions;
  /**
   * Boolean flags used in *ngIf to decide whether or not to show a given chart
   */
  public showChart = {
    income: false,
    expense: false,
  };
  /**
   * Holds the "legends" for both charts
   */
  public legends = {
    income: [],
    expense: [],
  };
  private categoryInfos: CategoryStats[] = [];

  constructor(
    private elementRef: ChangeDetectorRef,
    private backend: BackendService,
    private categories: CategoriesService,
  ) {
  }

  get hasData() {
    return (this.legends.income && this.legends.income.length > 0) || (this.legends.expense && this.legends.expense.length > 0);
  }

  ngOnInit() {
    this.changePeriod('weekly');
  }

  /**
   * Triggered when the user changes the "period" dropdown
   */
  public changePeriod(value: 'monthly' | 'weekly' | 'half_year') {
    let startDate = null;
    let endDate = null;

    switch (value) {
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date();
        break;
      case 'half_year':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = new Date();
        break;
    }

    console.log(startDate, endDate);

    this.refresh(startDate, endDate);
  }

  hasIncomeData() {
    return this.legends.income.length;
  }

  hasExpensesData() {
    return this.legends.expense.length;
  }

  private toggleChartVisibility(show: boolean = false) {
    this.showChart.income = show;
    this.showChart.expense = show;
    this.elementRef.detectChanges();
  }

  private refresh(startDate: Date = null, endDate: Date = null) {
    this.isLoading = true;
    this.toggleChartVisibility(false);

    const params = {};

    if (startDate !== null) {
      params['start_date'] = this.formatDate(startDate);
    }
    if (endDate !== null) {
      params['end_date'] = this.formatDate(endDate);
    }

    // this.makeFakeChart();

    this.backend.request('stats/by_category', 'GET')
      .subscribe((apiResult: {
        id: string,
        name: string,
        income_for_period: number,
        expense_for_period: number,
      }[]) => {
        console.log(apiResult);

        this.legends.income = apiResult
          .filter(elem => {
            return elem.income_for_period > 0;
          })
          .map(elem => elem.name ? elem.name : elem.id);

        this.legends.expense = apiResult
          .filter(elem => {
            return elem.expense_for_period < 0;
          })
          .map(elem => elem.name ? elem.name : elem.id);

        this.dataSets.income = [
          {
            label: 'Income',
            data: apiResult
              .filter(elem => elem.income_for_period > 0)
              .map(elem => elem.income_for_period),
          }
        ];

        this.dataSets.expenses = [
          {
            label: 'Expenses',
            data: apiResult
              .filter(elem => elem.expense_for_period < 0)
              .map(elem => Math.abs(elem.expense_for_period)),
          }
        ];

        this.isLoading = false;

        this.toggleChartVisibility(true);
      });
    // this.backend.request('stats/by_category', 'GET', params).subscribe(apiResult => {
    //
    //   // Extract and fill category names for each stats object
    //   this.categoryInfos = apiResult['categories'].map(cat => {
    //     return cat;
    //   });
    //
    //   this.legends.income = this.categoryInfos
    //     .filter(elem => {
    //       return elem.income_for_period > 0;
    //     })
    //     .map(elem => elem.name ? elem.name : elem.id);
    //   this.legends.expense = this.categoryInfos
    //     .filter(elem => {
    //       return elem.expense_for_period < 0;
    //     })
    //     .map(elem => elem.name ? elem.name : elem.id);
    //
    //   this.dataSets.expenses = [
    //     {
    //       label: 'Expenses',
    //       data: this.categoryInfos
    //         .filter(elem => elem.expense_for_period < 0)
    //         .map(elem => elem.expense_for_period),
    //     }
    //   ];
    //   this.dataSets.income = [
    //     {
    //       label: 'Income',
    //       data: this.categoryInfos
    //         .filter(elem => elem.income_for_period > 0)
    //         .map(elem => elem.income_for_period),
    //     }
    //   ];
    //
    //   this.toggleChartVisibility(true);
    // });
  }

  private formatDate(date: Date) {
    return date.getTime();
    // const d = date;
    // return d.getFullYear() + '-' +
    //   ('00' + (d.getMonth() + 1)).slice(-2) + '-' +
    //   ('00' + d.getDate()).slice(-2) + ' ' +
    //   ('00' + d.getHours()).slice(-2) + ':' +
    //   ('00' + d.getMinutes()).slice(-2) + ':' +
    //   ('00' + d.getSeconds()).slice(-2);
  }

  private makeFakeChart() {
    this.categoryInfos = [
      {
        id: 1,
        name: 'Food',
        expense_for_period: 100,
        income_for_period: 13,
      },
      {
        id: 2,
        name: 'Clothes',
        expense_for_period: 100,
        income_for_period: 13,
      },
    ];

    this.legends.income = [
      'Food',
      'Clothes',
    ];

    this.legends.expense = [
      'Food',
      'Clothes',
    ];

    this.dataSets.expenses = [
      {
        label: 'Expenses',
        data: [10, 20],
      }
    ];
    this.dataSets.income = [
      {
        label: 'Income',
        data: [10, 20],
      }
    ];
    this.toggleChartVisibility(true);
  }
}
