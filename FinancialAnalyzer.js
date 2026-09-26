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
    "คิดว่าเปย์ตัวเองวันวันนี้ พรุ่งนี้เปย์ค่าน้ำตาตัวเองแล้วกัน"
  ];

  constructor(budgetAccount) {
    this.#account = budgetAccount;
  }

  addExpense(expense) {
    this.#expenses.push(expense);
    this.#account.deduct(expense.getAmount());
  }

  removeExpense(expenseId) {
    const index = this.#expenses.findIndex(e => e.getId() === expenseId);
    if (index !== -1) {
      const removed = this.#expenses.splice(index, 1)[0];
      this.#account.addBack(removed.getAmount());
      return true;
    }
    return false;
  }

  getExpenses(filterLevel = 'ALL') {
    if (filterLevel === 'ALL') return [...this.#expenses];
    return this.#expenses.filter(e => e.getCategoryLevel() === filterLevel);
  }

  getTotalSpent() {
    return this.#expenses.reduce((sum, e) => sum + e.getAmount(), 0);
  }

  getTotalSpentByLevel(level) {
    return this.#expenses
      .filter(e => e.getCategoryLevel() === level)
      .reduce((sum, e) => sum + e.getAmount(), 0);
  }

  // คำนวณอัตราส่วนของเงินที่เสียไปกับ "กิเลส (Impulse)" (%)
  getImpulseRatio() {
    const total = this.getTotalSpent();
    if (total === 0) return 0;
    return Math.round((this.getTotalSpentByLevel('IMPULSE') / total) * 100);
  }

  // คำนวณคะแนนวินัยทางการเงิน (0 - 100)
  getGuiltyScore() {
    const total = this.getTotalSpent();
    if (total === 0) return 100;
    const impulseRatio = this.getImpulseRatio();
    const score = 100 - impulseRatio;
    return score < 0 ? 0 : score;
  }

  getRandomSarcasm(expense) {
    if (!expense.isImpulse()) return null;
    const randomIndex = Math.floor(Math.random() * this.#sarcasticQuotes.length);
    const impulseRatio = this.getImpulseRatio();
    return {
      quote: this.#sarcasticQuotes[randomIndex],
      ratioWarning: `ตอนนี้เงินของคุณจมไปกับกิเลสแล้ว ${impulseRatio}%!`
    };
  }
  // คัดแยก 3 รายการกิเลสที่แพงที่สุด
  getTopImpulseExpenses(limit = 3) {
    return this.#expenses
      .filter(exp => exp.isImpulse())
      .sort((a, b) => b.getAmount() - a.getAmount())
      .slice(0, limit);
  }
}