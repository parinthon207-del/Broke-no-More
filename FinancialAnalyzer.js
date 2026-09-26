import { Expense } from './Expense.js';
import { EssentialExpense } from './EssentialExpense.js';
import { RewardExpense } from './RewardExpense.js';
import { ImpulseExpense } from './ImpulseExpense.js';

/**
 * คลาสสมองกลสำหรับคำนวณ วิเคราะห์เปอร์เซ็นต์กิเลส และสุ่มข้อความเตือนสติ
 */
export class FinancialAnalyzer {
  #expenses = [];
  #account;

  #sarcasticQuotes = [
    "กดตะกร้าไวเหมือนโกหก สิ้นเดือนกินมาม่าแน่นอน!",
    "กิเลสหนาขนาดนี้ วอลเล็ตในมือมันสั่นเลยสิ?",
    "สุ่มกาชาได้เกลือ แต่สุ่มรายจ่ายได้ถังแตกนะจ๊ะ",
    "คิดว่าเปย์ตัวเองในวันนี้ พรุ่งนี้เปย์ค่าน้ำตาตัวเองแล้วกัน"
  ];

  constructor(budgetAccount) {
    this.#account = budgetAccount;
    this.loadExpenses();
  }

  // 🟢 แก้ไขการโหลดข้อมูลให้สร้าง Instance ของ Subclasses ตาม Polymorphism
  loadExpenses() {
    const data = localStorage.getItem('expenses_list');
    if (data) {
      try {
        const rawList = JSON.parse(data);
        this.#expenses = rawList.map(item => {
          let exp;
          if (item.categoryLevel === 'ESSENTIAL') {
            exp = new EssentialExpense(item.amount, item.note);
          } else if (item.categoryLevel === 'REWARD') {
            exp = new RewardExpense(item.amount, item.note);
          } else {
            exp = new ImpulseExpense(item.amount, item.note);
          }
          return exp;
        });
      } catch (e) {
        console.error("Failed to load expenses from localStorage", e);
      }
    }
  }

  saveExpenses() {
    const plainList = this.#expenses.map(e => ({
      amount: e.getAmount(),
      note: e.getNote(),
      categoryLevel: e.getCategoryBadge().level
    }));
    localStorage.setItem('expenses_list', JSON.stringify(plainList));
  }

  addExpense(expense) {
    this.#expenses.push(expense);
    this.#account.deduct(expense.getAmount());
    this.saveExpenses();
  }

  removeExpense(expenseId) {
    const index = this.#expenses.findIndex(e => e.getId() === expenseId);
    if (index !== -1) {
      const removed = this.#expenses.splice(index, 1)[0];
      this.#account.addBack(removed.getAmount());
      this.saveExpenses();
      return true;
    }
    return false;
  }

  getExpenses(filterLevel = 'ALL') {
    if (filterLevel === 'ALL') return [...this.#expenses];
    return this.#expenses.filter(e => e.getCategoryBadge().level === filterLevel);
  }

  getTotalSpent() {
    return this.#expenses.reduce((sum, e) => sum + e.getAmount(), 0);
  }

  getTotalSpentByLevel(level) {
    return this.#expenses
      .filter(e => e.getCategoryBadge().level === level)
      .reduce((sum, e) => sum + e.getAmount(), 0);
  }

  getImpulseRatio() {
    const total = this.getTotalSpent();
    if (total === 0) return 0;
    return Math.round((this.getTotalSpentByLevel('IMPULSE') / total) * 100);
  }

  getGuiltyScore() {
    const total = this.getTotalSpent();
    if (total === 0) return 100;
    const impulseRatio = this.getImpulseRatio();
    const score = 100 - impulseRatio;
    return score < 0 ? 0 : score;
  }

  getRandomSarcasm(expense) {
    if (expense.getCategoryBadge().level !== 'IMPULSE') return null;
    const randomIndex = Math.floor(Math.random() * this.#sarcasticQuotes.length);
    const impulseRatio = this.getImpulseRatio();
    return {
      quote: this.#sarcasticQuotes[randomIndex],
      ratioWarning: `ตอนนี้เงินของคุณจมไปกับกิเลสแล้ว ${impulseRatio}%!`
    };
  }

  getTopImpulseExpenses(limit = 3) {
    return this.#expenses
      .filter(exp => exp.getCategoryBadge().level === 'IMPULSE')
      .sort((a, b) => b.getAmount() - a.getAmount())
      .slice(0, limit);
  }

  // 🟢 แปลงรูปแบบวันให้อยู่ในรูปแบบ Date Object ปลอดภัย
  getExpenseDateObj(exp) {
    if (typeof exp.getDate === 'function' && exp.getDate() instanceof Date) {
      return exp.getDate();
    }
    return new Date();
  }

  getTodaySpent() {
    const today = new Date().toDateString();
    return this.#expenses
      .filter(exp => this.getExpenseDateObj(exp).toDateString() === today)
      .reduce((sum, exp) => sum + exp.getAmount(), 0);
  }

  getTodayRemainingAllowance() {
    const baseDaily = this.#account.getBaseDailyAllowance();
    const todaySpent = this.getTodaySpent();
    const remaining = baseDaily - todaySpent;
    return remaining > 0 ? remaining : 0;
  }

  // 🟢 สรุปหมวดหมู่รายวันสำหรับปฏิทิน
  getDailyCategorySummary() {
    const summary = {};

    this.#expenses.forEach(exp => {
      const d = this.getExpenseDateObj(exp);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!summary[dateStr]) {
        summary[dateStr] = new Set();
      }
      summary[dateStr].add(exp.getCategoryBadge().level);
    });

    return summary;
  }

  // 🟢 รายการใช้จ่ายรายวันสำหรับ Tooltip ในปฏิทิน
  getExpensesByDateMap() {
    const map = {};

    this.#expenses.forEach(exp => {
      const d = this.getExpenseDateObj(exp);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(exp);
    });

    return map;
  }
}