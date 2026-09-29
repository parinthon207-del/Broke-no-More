import { BudgetAccount } from './BudgetAccount.js';
import { FinancialAnalyzer } from './FinancialAnalyzer.js';
import { UIManager } from './UIManager.js';

// รายการข้อความเตือนสติสุ่มฮาๆ[cite: 17]
const impulseWarnings = [
  "คิดดีๆ นะ... ของชิ้นนี้จำเป็นจริงๆ หรือแค่อยากได้ตามอารมณ์? 💸",
  "ยิ้มให้กับการจ่าย แล้วไห้กับการกินมาม่าปลายเดือนนะ! 😭",
  "หยุดก่อน! ลองหายใจเข้าลึกๆ 10 วิ แล้วถามตัวเองอีกทีว่าซื้อไปทำไม 🤔",
  "ซื้ออันนี้แล้ว งบวันถัดๆ ไปหดแน่ คิดดูดีๆ! 🚨",
  "เงินก้อนนี้ เอาไปซื้อของกินหรือเก็บไว้ปังๆ ดีกว่าไหม?"
];

// ฟังก์ชันเปิด Alert Modal Custom[cite: 17]
function showAlert(title, message, icon = '⚠️') {
  const alertModal = document.getElementById('custom-alert-modal');
  const alertIcon = document.getElementById('custom-alert-icon');
  const alertTitle = document.getElementById('custom-alert-title');
  const alertMessage = document.getElementById('custom-alert-message');

  if (alertModal) {
    if (alertIcon) alertIcon.textContent = icon;
    if (alertTitle) alertTitle.textContent = title;
    if (alertMessage) alertMessage.textContent = message;
    alertModal.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. สร้าง Instance ต่างๆ[cite: 17]
  const account = new BudgetAccount();
  const analyzer = new FinancialAnalyzer(account);
  const ui = new UIManager(analyzer, account);

  ui.init(); //[cite: 17]

  // 2. จัดการส่วน "บันทึกงบประมาณ"[cite: 17]
  const saveBudgetBtn = document.getElementById('save-budget-btn'); //[cite: 17]
  const totalBudgetInput = document.getElementById('total-budget'); //[cite: 17]
  const budgetDaysInput = document.getElementById('budget-days'); //[cite: 17]

  if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', () => {
      const budgetVal = parseFloat(totalBudgetInput.value); //[cite: 17]
      const daysVal = parseInt(budgetDaysInput.value); //[cite: 17]

      if (isNaN(budgetVal) || budgetVal <= 0) { //[cite: 17]
        showAlert('แจ้งเตือน', 'กรุณากรอกงบประมาณรวมให้ถูกต้อง', '⚠️'); //[cite: 17]
        return;
      }

      if (isNaN(daysVal) || daysVal <= 0) { //[cite: 17]
        showAlert('แจ้งเตือน', 'กรุณากรอกจำนวนวันให้ถูกต้อง', '⚠️'); //[cite: 17]
        return;
      }

      // บันทึกลง LocalStorage[cite: 17]
      localStorage.setItem('totalBudget', budgetVal); //[cite: 17]
      localStorage.setItem('budgetDays', daysVal); //[cite: 17]

      // อัปเดตค่างบเข้า Object account[cite: 17]
      if (typeof account.setBudget === 'function') { //[cite: 17]
        account.setBudget(budgetVal, daysVal); //[cite: 17]
      } else {
        account.totalBudget = budgetVal; //[cite: 17]
        account.budgetDays = daysVal; //[cite: 17]
      }

      // สั่งให้ UI แสดงผลคำนวณใหม่ทันที[cite: 17]
      if (typeof ui.updateUI === 'function') { //[cite: 17]
        ui.updateUI(); //[cite: 17]
      } else if (typeof ui.render === 'function') { //[cite: 17]
        ui.render(); //[cite: 17]
      } else {
        ui.init(); //[cite: 17]
      }

      showAlert('บันทึกสำเร็จ!', `ตั้งค่างบ ${budgetVal.toLocaleString()} บาท สำหรับ ${daysVal} วัน เรียบร้อยแล้ว`, '🎉'); //[cite: 17]
    });
  }

  // 3. จัดการส่วน "เตือนสติสายเปย์ (Impulse)"[cite: 17]
  const levelInputs = document.querySelectorAll('input[name="level"]'); //[cite: 17]
  levelInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'IMPULSE') { //[cite: 17]
        const randomMsg = impulseWarnings[Math.floor(Math.random() * impulseWarnings.length)]; //[cite: 17]
        showAlert("เตือนสติคนสายเปย์!", randomMsg, "💸"); //[cite: 17]
      }
    });
  });

  // 4. ปุ่มปิด Alert Modal[cite: 17]
  const alertBtn = document.getElementById('custom-alert-btn'); //[cite: 17]
  const alertModal = document.getElementById('custom-alert-modal'); //[cite: 17]
  if (alertBtn && alertModal) {
    alertBtn.addEventListener('click', () => {
      alertModal.classList.remove('active'); //[cite: 17]
    });
  }
});