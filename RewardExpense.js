import { Expense } from './Expense.js';

export class RewardExpense extends Expense {
  getCategoryBadge() {
    return { icon: '🟡', label: 'รางวัล (Reward)', color: '#F59E0B', level: 'REWARD' };
  }
}