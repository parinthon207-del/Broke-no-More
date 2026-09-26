// ใน Expense.js (คลาสแม่)
export class Expense {
  #amount;
  #note;
  #date; // 🟢 เพิ่มตัวแปรวันที่

  constructor(amount, note) {
    this.#amount = amount;
    this.#note = note;
    this.#date = new Date().toISOString().split('T')[0]; // เก็บวันที่ YYYY-MM-DD
  }

  getAmount() { return this.#amount; }
  getNote() { return this.#note; }
  getDate() { return this.#date; } // 🟢 เมธอดดึงวันที่

  getCategoryBadge() {
    return { icon: '💸', label: 'ทั่วไป', color: '#64748B', level: 'GENERAL' };
  }
}