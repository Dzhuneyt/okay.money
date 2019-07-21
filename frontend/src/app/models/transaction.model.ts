import {Category} from 'src/app/services/categories.service';
import {Account} from 'src/app/services/accounts.service';

export interface TransactionModel {
  id?: number;
  description: string;
  sum?: number;
  category: Category;
  account: Account;
}
