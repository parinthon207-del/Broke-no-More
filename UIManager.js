import { Expense } from './Expense.js';

export class UIManager {
  #analyzer;
  #account;
  #currentFilter = 'ALL'; // 1. เพิ่ม State เก็บค่า Filter

  constructor(analyzer, account) {
    this.#analyzer = analyzer;
    this.#account = account;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const form = document.querySelector('#expense-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // 2. ผูก Event ให้ปุ่ม Filter ประวัติรายจ่าย
    const filterContainer = document.querySelector('.filter-buttons');
    if (filterContainer) {
      filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-filter')) {
          // เปลี่ยน class active ของปุ่ม
          document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');

          // อัปเดต Filter State และ Render รายการใหม่
          this.#currentFilter = e.target.dataset.filter;
          this.renderExpenseList();
        }
      });
    }
  }

  handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;


    const amountInput = document.querySelector('#amount-input');
    const noteInput = document.querySelector('#note-input');
    const levelSelect = document.querySelector('#level-select');

    const amount = parseFloat(amountInput.value);
    const note = noteInput.value;
    const level = levelSelect.value;

    try {
      const newExpense = new Expense(amount, note, level);
      this.#analyzer.addExpense(newExpense);

      if (newExpense.isImpulse()) {
        const sarcasm = this.#analyzer.getRandomSarcasm(newExpense);
        this.showSarcasmModal(sarcasm);
      }

      form.reset();
      this.render();
    } catch (error) {
      alert(error.message);
    }
  }

  render() {
    this.renderDashboard();
    this.renderExpenseList();
    this.renderVibeBar();
    this.renderCalendar();
    this.renderHallOfFame(); // 👈 สั่งวาด Hall of Fame
  }

  // ฟังก์ชันวาดรายการ Hall of Fame
  renderHallOfFame() {
    const container = document.querySelector('#hof-list');
    if (!container) return;

    const topImpulses = this.#analyzer.getTopImpulseExpenses(3);
    const badges = ['🥇', '🥈', '🥉'];

    if (topImpulses.length === 0) {
      container.innerHTML = `<div class="hof-empty">ยังไม่มีรายการกิเลส 🎉</div>`;
      return;
    }

    container.innerHTML = topImpulses.map((exp, index) => {
      return `
        <div class="hof-item">
          <span class="hof-rank">${badges[index]}</span>
          <span class="hof-note">${exp.getNote()}</span>
          <span class="hof-amount">${exp.getFormattedAmount()}</span>
        </div>
      `;
    }).join('');
  }

  renderVibeBar() {
    const total = this.#analyzer.getTotalSpent();
    if (total === 0) return;

    const essentialSpent = this.#analyzer.getTotalSpentByLevel('ESSENTIAL');
    const rewardSpent = this.#analyzer.getTotalSpentByLevel('REWARD');
    const impulseSpent = this.#analyzer.getTotalSpentByLevel('IMPULSE');

    const essentialPct = Math.round((essentialSpent / total) * 100);
    const rewardPct = Math.round((rewardSpent / total) * 100);
    const impulsePct = Math.round((impulseSpent / total) * 100);

    const barEssential = document.querySelector('#bar-essential');
    const barReward = document.querySelector('#bar-reward');
    const barImpulse = document.querySelector('#bar-impulse');

    if (barEssential) barEssential.style.width = `${essentialPct}%`;
    if (barReward) barReward.style.width = `${rewardPct}%`;
    if (barImpulse) barImpulse.style.width = `${impulsePct}%`;

    const legendEssential = document.querySelector('#legend-essential');
    const legendReward = document.querySelector('#legend-reward');
    const legendImpulse = document.querySelector('#legend-impulse');

    if (legendEssential) legendEssential.textContent = `🟢 จำเป็น ${essentialPct}%`;
    if (legendReward) legendReward.textContent = `🟡 รางวัล ${rewardPct}%`;
    if (legendImpulse) legendImpulse.textContent = `🔴 กิเลส ${impulsePct}%`;
  }

  renderDashboard() {
    const balanceEl = document.querySelector('#current-balance');
    const allowanceEl = document.querySelector('#daily-allowance');
    const scoreEl = document.querySelector('#guilty-score');

    if (balanceEl) balanceEl.textContent = `฿${this.#account.getCurrentBalance().toLocaleString()}`;
    if (allowanceEl) allowanceEl.textContent = `฿${Math.round(this.#account.calculateDailyAllowance()).toLocaleString()}/วัน`;
    if (scoreEl) scoreEl.textContent = `${this.#analyzer.getGuiltyScore()} / 100`;
  }

  // 3. ส่ง #currentFilter ไปดึงรายการจาก FinancialAnalyzer
  renderExpenseList() {
    const listContainer = document.querySelector('#expense-list');
    if (!listContainer) return;

    const expenses = this.#analyzer.getExpenses(this.#currentFilter);
    
    if (expenses.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 12px;">ไม่มีรายการใช้จ่าย</div>`;
      return;
    }

    listContainer.innerHTML = expenses.map(exp => {
      const badge = exp.getCategoryBadge();
      return `
        <div class="expense-card" data-id="${exp.getId()}">
          <span>${badge.icon} ${exp.getNote()}</span>
          <strong>${exp.getFormattedAmount()}</strong>
        </div>
      `;
    }).join('');
  }

  renderCalendar() {
    const grid = document.querySelector('#calendar-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="day-name">อา</div><div class="day-name">จ</div><div class="day-name">อ</div>
      <div class="day-name">พ</div><div class="day-name">พฤ</div><div class="day-name">ศ</div><div class="day-name">ส</div>
    `;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const allExpenses = this.#analyzer.getExpenses();

    for (let i = 0; i < firstDayIndex; i++) {
      grid.innerHTML += `<div class="day-cell empty"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const isToday = day === now.getDate() ? 'today' : '';
      
      const dayExpenses = allExpenses.filter(e => {
        const d = e.getDate();
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      });

      const hasEssential = dayExpenses.some(e => e.getCategoryLevel() === 'ESSENTIAL');
      const hasReward = dayExpenses.some(e => e.getCategoryLevel() === 'REWARD');
      const hasImpulse = dayExpenses.some(e => e.getCategoryLevel() === 'IMPULSE');

      let dotsHtml = '';
      if (hasEssential) dotsHtml += `<span class="dot green"></span>`;
      if (hasReward) dotsHtml += `<span class="dot yellow"></span>`;
      if (hasImpulse) dotsHtml += `<span class="dot red"></span>`;

      grid.innerHTML += `
        <div class="day-cell ${isToday}">
          <span>${day}</span>
          <div class="dots">${dotsHtml}</div>
        </div>
      `;
    }
  }

  // ใน UIManager.js

bindEvents() {
  const form = document.querySelector('#expense-form');
  if (form) {
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }

  // ปุ่มกดปิด Modal เตือนสติ
  const closeBtn = document.querySelector('#close-modal-btn');
  const modal = document.querySelector('#sarcasm-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Filter Buttons
  const filterContainer = document.querySelector('.filter-buttons');
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-filter')) {
        document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.#currentFilter = e.target.dataset.filter;
        this.renderExpenseList();
      }
    });
  }
}

// ปรับปรุงฟังก์ชันแสดง Modal
showSarcasmModal(sarcasmData) {
  if (!sarcasmData) return;
  
  const modal = document.querySelector('#sarcasm-modal');
  const quoteEl = document.querySelector('#modal-quote');
  const warningEl = document.querySelector('#modal-warning');

  if (modal && quoteEl && warningEl) {
    quoteEl.textContent = `"${sarcasmData.quote}"`;
    warningEl.textContent = sarcasmData.ratioWarning;
    modal.classList.add('active'); // เปิด Pop-up พร้อมเด้งแบบ Animation
  }
}
}