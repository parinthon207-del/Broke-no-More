import { BudgetAccount } from './BudgetAccount.js';
import { FinancialAnalyzer } from './FinancialAnalyzer.js';
import { UIManager } from './UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
  // สร้างโดยดึงค่าจาก LocalStorage อัตโนมัติ
  const account = new BudgetAccount();
  const analyzer = new FinancialAnalyzer(account);
  const ui = new UIManager(analyzer, account);

  ui.init();
});