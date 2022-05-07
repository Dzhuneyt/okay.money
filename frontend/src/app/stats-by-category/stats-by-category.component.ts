import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {BackendService} from 'src/app/services/backend.service';
import {tap} from 'rxjs/operators';


const chartOptions: ChartOptions = {
  responsive: true,
  // tooltips: {
  //   enabled: true,
  // },
  // legend: {
  //   display: true,
  //   position: 'right',
  // },
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

  constructor(
    private elementRef: ChangeDetectorRef,
    private backend: BackendService,
  ) {
  }

  get hasData() {
    return (this.legends.income && this.legends.income.length > 0) || (this.legends.expense && this.legends.expense.length > 0);
  }

  public isLoading = true;

  public tab: 'income' | 'expenses' = 'expenses';

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

  public doughnutChartType: ChartType = 'doughnut';

  private static formatDate(date: Date) {
    return date.getTime();
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
      params['start_date'] = StatsByCategoryComponent.formatDate(startDate);
    }
    if (endDate !== null) {
      params['end_date'] = StatsByCategoryComponent.formatDate(endDate);
    }

    this.backend.request('stats/by-category', 'GET').pipe(
      tap((apiResult: {
        id: string,
        name: string,
        income_for_period: number,
        expense_for_period: number,
      }[]) => {
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
      }),
      tap(() => this.isLoading = false),
      tap(() => this.toggleChartVisibility(true)),
    ).subscribe();
  }

  private makeFakeChart() {

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

  changeTab(tab: 'expenses' | 'income') {
    this.tab = tab;
  }
}
