import {TableColumnType} from 'src/app/ui-kit/table/table.component';
import {TransactionModel} from 'src/app/models/transaction.model';

export const TransactionListColumns = [
  {
    label: 'Date',
    code: 'created_at',
    type: TableColumnType.dateTime,
  },
  {
    label: 'Amount',
    code: 'sum',
    renderer: (element: TransactionModel) => {
      if (element.sum > 0) {
        return `<span class="green-text">+${Math.abs(element.sum)}</span>`;
      }
      return `<span class="red-text">-${Math.abs(element.sum)}</span>`;
    }
  },
  {
    label: 'Category',
    code: 'category_name',
    renderer: (element: TransactionModel) => element.category.title,
  },
  {
    label: 'Account',
    code: 'account_name',
    renderer: (element: TransactionModel) => element.account.title,
  },
  {
    label: 'Description',
    code: 'description',
  },
];
