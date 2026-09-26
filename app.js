import { BudgetAccount } from './BudgetAccount.js';
import { FinancialAnalyzer } from './FinancialAnalyzer.js';
import { UIManager } from './UIManager.js';

// Initialize System
const myAccount = new BudgetAccount(15000, 30); // ตั้งงบ 15,000 บาท เหลือเวลา 20 วัน
const analyzer = new FinancialAnalyzer(myAccount);
const ui = new UIManager(analyzer, myAccount);

document.addEventListener('DOMContentLoaded', () => {
  ui.init();
});