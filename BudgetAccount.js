/**
 * คลาสสำหรับจัดการงบประมาณและยอดเงินคงเหลือ (Encapsulation)
 */
export class BudgetAccount {
  #monthlyBudget;
  #currentBalance;
  #daysRemaining;

  constructor(monthlyBudget, daysRemaining = 30) {
    if (monthlyBudget <= 0 || daysRemaining <= 0) {
      throw new Error("Budget and Days Remaining must be greater than zero.");
    }
    this.#monthlyBudget = monthlyBudget;
    this.#currentBalance = monthlyBudget;
    this.#daysRemaining = daysRemaining;
  }

  // Encapsulated Methods สำหรับแก้ไข State ป้องกันการปรับเปลี่ยนยอดเงินโดยตรง
  deduct(amount) {
    if (amount <= 0) return false;
    this.#currentBalance -= amount;
    return true;
  }

  addBack(amount) {
    if (amount <= 0) return false;
    this.#currentBalance += amount;
    return true;
  }

  getMonthlyBudget() { return this.#monthlyBudget; }
  getCurrentBalance() { return this.#currentBalance; }
  getDaysRemaining() { return this.#daysRemaining; }

  // คำนวณงบประมาณที่ใช้ได้ต่อวันจนถึงสิ้นเดือน
  calculateDailyAllowance() {
    if (this.#daysRemaining <= 0) return 0;
    const allowance = this.#currentBalance / this.#daysRemaining;
    return allowance > 0 ? allowance : 0;
  }
}