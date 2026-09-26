import { Expense } from './Expense.js';

export class ImpulseExpense extends Expense {
  getCategoryBadge() {
    return { icon: '🔴', label: 'ฟุ่มเฟือย (Want)', color: '#EF4444', level: 'IMPULSE' };
  }
}