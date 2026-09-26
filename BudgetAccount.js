/**
 * คลาสสำหรับจัดการงบประมาณและยอดเงินคงเหลือ (Encapsulation)
 */
export class BudgetAccount {
  #monthlyBudget;
  #currentBalance;
  #daysRemaining;

  constructor(defaultBudget = 15000, defaultDays = 30) {
    // 1. อ่านค่าจาก localStorage
    const savedBudget = parseFloat(localStorage.getItem('monthlyBudget'));
    const savedBalance = parseFloat(localStorage.getItem('currentBalance'));
    const savedDays = parseInt(localStorage.getItem('daysRemaining'));

    // 2. ถ้าเป็น NaN (เปิดครั้งแรก) ให้ใช้ค่า Default ทันที
    this.#monthlyBudget = !isNaN(savedBudget) ? savedBudget : defaultBudget;
    this.#currentBalance = !isNaN(savedBalance) ? savedBalance : this.#monthlyBudget;
    this.#daysRemaining = !isNaN(savedDays) ? savedDays : defaultDays;

    // บันทึกค่าเริ่มต้นไว้ในระบบ
    this.save();
  }

  setBudget(newBudget, totalDays) {
    // 🟢 หากมียอดติดลบอยู่เดิม นำงบใหม่มาหักล้างหนี้เดิมก่อน
    if (this.#currentBalance < 0) {
      this.#currentBalance = newBudget + this.#currentBalance;
    } else {
      this.#currentBalance = newBudget;
    }

    this.#monthlyBudget = newBudget;
    this.#daysRemaining = totalDays;
    
    // 🟢 เรียกใช้ save() ซึ่งเป็นเมธอดที่มีอยู่ในคลาสจริง
    this.save();
  }

  deduct(amount) {
    if (amount <= 0 || isNaN(amount)) return false;
    this.#currentBalance -= amount;
    this.save();
    return true;
  }

  addBack(amount) {
    if (amount <= 0 || isNaN(amount)) return false;
    this.#currentBalance += amount;
    this.save();
    return true;
  }

  getMonthlyBudget() { return this.#monthlyBudget; }
  getCurrentBalance() { return this.#currentBalance; }
  getDaysRemaining() { return this.#daysRemaining; }

  // คำนวณโควตาตั้งต้นต่อวัน (งบรวม / จำนวนวัน)
  getBaseDailyAllowance() {
    if (this.#daysRemaining <= 0) return 0;
    return this.#monthlyBudget / this.#daysRemaining;
  }

  // บันทึกลง localStorage
  save() {
    localStorage.setItem('monthlyBudget', this.#monthlyBudget);
    localStorage.setItem('currentBalance', this.#currentBalance);
    localStorage.setItem('daysRemaining', this.#daysRemaining);
  }
}