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
  private categoryInfos: CategoryStats[] = [];

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
    expsense: [],
  };

  constructor(
    private elementRef: ChangeDetectorRef,
    private backend: BackendService,
    private categories: CategoriesService,
  ) {
  }

  ngOnInit() {
    this.statsPeriodChange('weekly');
  }

  categoryStatsLabels() {
    return this.categoryInfos.map(elem => elem.name ? elem.name : elem.id);
  }

  /**
   * Triggered when the user changes the "period" dropdown
   */
  public statsPeriodChange(value: 'monthly' | 'weekly' | 'half_year') {
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

    this.getStatsByCategory(startDate, endDate);
  }

  private toggleCharts(show: boolean = null) {
    if (show === null) {
      this.showChart.income = !this.showChart.income;
      this.showChart.expense = !this.showChart.expense;
      return;
    } else {
      this.showChart.income = show;
      this.showChart.expense = show;
    }
    this.elementRef.detectChanges();
  }

  private getStatsByCategory(startDate: Date = null, endDate: Date = null) {
    this.toggleCharts(false);

    const params = {};

    if (startDate !== null) {
      params['start_date'] = this.formatDate(startDate);
    }
    if (endDate !== null) {
      params['end_date'] = this.formatDate(endDate);
    }
    this.backend.request('stats/by_category', 'GET', params).subscribe(apiResult => {

      // Extract and fill category names for each stats object
      this.categoryInfos = apiResult['categories'].map(cat => {
        return cat;
      });

      this.legends.income = this.categoryInfos
        .filter(elem => {
          return elem.income_for_period > 0;
        })
        .map(elem => elem.name ? elem.name : elem.id);
      this.legends.expsense = this.categoryInfos
        .filter(elem => {
          return elem.expense_for_period < 0;
        })
        .map(elem => elem.name ? elem.name : elem.id);

      this.dataSets.expenses = [
        {
          label: 'Expenses',
          data: this.categoryInfos
            .filter(elem => elem.expense_for_period < 0)
            .map(elem => elem.expense_for_period),
        }
      ];
      this.dataSets.income = [
        {
          label: 'Income',
          data: this.categoryInfos
            .filter(elem => elem.income_for_period > 0)
            .map(elem => elem.income_for_period),
        }
      ];

      this.toggleCharts(true);
    });
  }

  private formatDate(date) {
    const d = date;
    return d.getFullYear() + '-' +
      ('00' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('00' + d.getDate()).slice(-2) + ' ' +
      ('00' + d.getHours()).slice(-2) + ':' +
      ('00' + d.getMinutes()).slice(-2) + ':' +
      ('00' + d.getSeconds()).slice(-2);
  }

  get hasData() {
    return (this.legends.income && this.legends.income.length > 0) || (this.legends.expsense && this.legends.expsense.length > 0);
  }
}
