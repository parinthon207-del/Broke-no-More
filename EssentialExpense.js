import { Expense } from './Expense.js';

export class EssentialExpense extends Expense {
  getCategoryBadge() {
    return { icon: '🟢', label: 'จำเป็น (Need)', color: '#10B981', level: 'ESSENTIAL' };
  }
}