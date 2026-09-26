export class Transaction {
  #id;
  #amount;
  #date;
  #note;

  constructor(amount, note = '') {
    if (amount <= 0 || isNaN(amount)) {
      throw new Error("กรุณากรอกจำนวนเงินให้ถูกต้อง");
    }
    if (!note.trim()) {
      throw new Error("กรุณากรอกชื่อรายการ");
    }

    this.#id = Date.now() + Math.random().toString(36).substr(2, 9);
    this.#amount = parseFloat(amount);
    this.#date = new Date();
    this.#note = note.trim();
  }

  getId() { return this.#id; }
  getAmount() { return this.#amount; }
  getDate() { return this.#date; }
  getNote() { return this.#note; }

  getFormattedAmount() {
    return `฿${this.#amount.toLocaleString()}`;
  }
}