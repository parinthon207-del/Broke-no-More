import { Transaction } from './Transaction.js';

/**
 * Child Class สำหรับการบันทึกรายจ่ายโดยเฉพาะ (Inheritance & Polymorphism)
 */
export class Expense extends Transaction {
  #categoryLevel; // 'ESSENTIAL' | 'REWARD' | 'IMPULSE'

  static CATEGORY_TYPES = {
    ESSENTIAL: { label: 'Need (จำเป็น)', color: '#10B981', icon: '🟢' },
    REWARD: { label: 'Reward (รางวัลชีวิต)', color: '#F59E0B', icon: '🟡' },
    IMPULSE: { label: 'Impulse (กิเลส)', color: '#EF4444', icon: '🔴' }
  };

  constructor(amount, note, categoryLevel = 'ESSENTIAL') {
    super(amount, note); // สืบทอด id, amount, date, note จาก Transaction

    if (!Expense.CATEGORY_TYPES[categoryLevel]) {
      throw new Error(`Invalid Category Level: ${categoryLevel}`);
    }
    this.#categoryLevel = categoryLevel;
  }

  getCategoryLevel() {
    return this.#categoryLevel;
  }

  getCategoryBadge() {
    return Expense.CATEGORY_TYPES[this.#categoryLevel];
  }

  isImpulse() {
    return this.#categoryLevel === 'IMPULSE';
  }

  // Polymorphism: Override วิธีแสดงผลของ Parent Class
  getSummary() {
    const badge = this.getCategoryBadge();
    return `${badge.icon} [${badge.label}] ${this.getFormattedAmount()} : ${this.getNote()}`;
  }
}