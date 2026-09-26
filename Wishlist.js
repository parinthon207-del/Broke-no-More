export class Wishlist {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('wishlist_items')) || [];
  }

  // เพิ่มของที่อยากได้เข้าโซนพักใจ
  addItem(title, price) {
    const newItem = {
      id: Date.now(),
      title,
      price: parseFloat(price),
      createdAt: new Date().getTime() // บันทึกเวลาที่เริ่มดอง
    };
    this.items.push(newItem);
    this.save();
    return newItem;
  }

  // ลบรายการเมื่อชนะกิเลส
  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
  }

  // คำนวณเวลาที่เหลือ (48 ชม.)
  getRemainingTime(createdAt) {
    const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const diff = (createdAt + fortyEightHoursInMs) - now;

    if (diff <= 0) return { expired: true, text: '⏱️ ครบ 48 ชม. แล้ว! ตัดสินใจอีกที' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    return {
      expired: false,
      text: `⏱️ เหลือ ${pad(hours)}:${pad(minutes)}:${pad(seconds)} ชม.`
    };
  }

  save() {
    localStorage.setItem('wishlist_items', JSON.stringify(this.items));
  }
}