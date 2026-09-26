/**
 * Parent Class สำหรับบันทึกธุรกรรมทางการเงิน (Abstraction Basis)
 */
export class Transaction {
  #id;
  #amount;
  #date;
  #note;

  constructor(amount, note = '') {
    if (new.target === Transaction) {
      throw new Error("Cannot instantiate Abstract Class 'Transaction' directly.");
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error("Amount must be a positive number.");
    }

    this.#id = 'tx_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    this.#amount = amount;
    this.#date = new Date();
    this.#note = note.trim();
  }

  // Getters (Encapsulation)
  getId() { return this.#id; }
  getAmount() { return this.#amount; }
  getDate() { return this.#date; }
  getNote() { return this.#note; }

  getFormattedAmount() {
    return `฿${this.#amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
  }

  // Method สำหรับ Override ในคลาสลูก (Polymorphism Target)
  getSummary() {
    return `[${this.#date.toLocaleDateString()}] ${this.getFormattedAmount()} - ${this.#note}`;
  }
}