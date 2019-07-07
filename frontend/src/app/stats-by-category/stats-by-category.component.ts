import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
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

@Component({
  selector: 'app-stats-by-category',
  templateUrl: './stats-by-category.component.html',
  styleUrls: ['./stats-by-category.component.scss']
})
export class StatsByCategoryComponent implements OnInit {

  @ViewChild(BaseChartDirective) public chart: BaseChartDirective;
  public categoryLabels = [];
  public dataSets = {
    income: [],
    expenses: [],
  };
  public doughnutChartType: ChartType = 'pie';
  public chartOptions: ChartOptions = {
    responsive: true,
    tooltips: {
      enabled: true,
    },
    legend: {
      display: true,
      position: 'bottom'
    },
    hover: {
      intersect: false,
      mode: 'nearest'
    }
  };
  private categoryInfos: CategoryStats[] = [];

  constructor(
    private elementRef: ChangeDetectorRef,
    private backend: BackendService,
    private categories: CategoriesService,
  ) {
  }

  ngOnInit() {
    this.getStatsByCategory();
  }

  categoryStatsLabels() {
    return this.categoryInfos.map(elem => elem.name ? elem.name : elem.id);
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

        this.dataSets.expenses = [
          {
            label: 'Expenses',
            data: this.categoryInfos.map(elem => elem.expense_for_period)
          }
        ];
        this.dataSets.income = [
          {
            label: 'Income',
            data: this.categoryInfos.map(elem => elem.income_for_period),
          }
        ];
        this.categoryLabels = this.categoryStatsLabels();
        this.elementRef.detectChanges();
      });
    });
  }

}
