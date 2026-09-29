import { EssentialExpense } from './EssentialExpense.js';
import { RewardExpense } from './RewardExpense.js';
import { ImpulseExpense } from './ImpulseExpense.js';
import { Expense } from './Expense.js';

export class UIManager {
  #analyzer;
  #account;

  constructor(analyzer, account) {
    this.#analyzer = analyzer;
    this.#account = account;
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // 1. ฟอร์มตั้งค่างบประมาณ
    const budgetForm = document.querySelector('#budget-setup-form');
    if (budgetForm) {
      budgetForm.addEventListener('submit', (e) => this.handleBudgetSubmit(e));
    }

    // 2. ฟอร์มบันทึกรายจ่าย
    const form = document.querySelector('#expense-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // 3. ปุ่มกดเร็วยอดฮิต
    const quickBtns = document.querySelectorAll('.btn-quick');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const amount = e.currentTarget.dataset.val; 
        const amountInput = document.querySelector('#amount-input');
        if (amountInput) {
          amountInput.value = amount;
          amountInput.focus();
        }
      });
    });

    // 4. ปุ่มปิด Modal แจ้งเตือนเงินเกิน
    const closeModalBtn = document.querySelector('#close-modal-btn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.hideOverBudgetModal());
    }
  }

  handleBudgetSubmit(event) {
    event.preventDefault();
    const budgetInput = document.querySelector('#init-budget-input');
    const daysInput = document.querySelector('#init-days-input');

    if (!budgetInput || !daysInput) return;

    const newBudget = parseFloat(budgetInput.value);
    const newDays = parseInt(daysInput.value);

    try {
      const oldBalance = this.#account.getCurrentBalance();

      this.#account.setBudget(newBudget, newDays);

      if (oldBalance < 0) {
        const debtAmount = Math.abs(oldBalance);
        const actualBalance = this.#account.getCurrentBalance();
        
        this.showCustomAlert(
          'ตั้งค่างบประมาณสำเร็จ!',
          `เติมเงิน <strong>฿${newBudget.toLocaleString()}</strong> เรียบร้อย<br><br><span style="color: #EF4444; font-weight: 600;">⚠️ ระบบหักล้างยอดติดลบเดิม ฿${debtAmount.toLocaleString()} ออกแล้ว</span><br>ยอดคงเหลือใช้งานคือ: <strong style="color: #10B981;">฿${actualBalance.toLocaleString()}</strong>`,
          '⚖️'
        );
      } else {
        this.showCustomAlert(
          'ตั้งค่างบประมาณสำเร็จ!',
          `ตั้งค่างบประมาณ <strong>฿${newBudget.toLocaleString()}</strong> (${newDays} วัน) เรียบร้อย!`,
          '💰'
        );
      }

      this.render();
    } catch (error) {
      this.showCustomAlert('เกิดข้อผิดพลาด', error.message, '⚠️');
    }
  }

  handleFormSubmit(event) {
    event.preventDefault();

    const amountInput = document.querySelector('#amount-input');
    const noteInput = document.querySelector('#note-input');
    const selectedLevel = document.querySelector('input[name="level"]:checked');

    if (!amountInput || !noteInput || !selectedLevel) return;

    const amount = parseFloat(amountInput.value);
    const note = noteInput.value;
    const level = selectedLevel.value;

    try {
      // 🟢 สร้างวัตถุตาม Subclass (Polymorphism)
      let newExpense;
      if (level === 'ESSENTIAL') newExpense = new EssentialExpense(amount, note);
      else if (level === 'REWARD') newExpense = new RewardExpense(amount, note);
      else newExpense = new ImpulseExpense(amount, note);

      this.#analyzer.addExpense(newExpense);

      event.target.reset();
      const defaultRadio = document.querySelector('input[name="level"][value="ESSENTIAL"]');
      if (defaultRadio) defaultRadio.checked = true;

      this.render();
      this.checkOverBudgetAlert();

    } catch (error) {
      alert(error.message);
    }
  }

  checkOverBudgetAlert() {
    const baseDaily = this.#account.getBaseDailyAllowance();
    const todaySpent = this.#analyzer.getTodaySpent();

    if (todaySpent > baseDaily) {
      const overAmount = todaySpent - baseDaily;
      const modal = document.querySelector('#over-budget-modal');
      const textEl = document.querySelector('#over-budget-text');

      if (modal && textEl) {
        textEl.innerHTML = `โควตาต่อวันของคุณคือ <strong>฿${Math.round(baseDaily).toLocaleString()}</strong><br>แต่วันนี้คุณใช้ไปแล้ว <strong>฿${Math.round(todaySpent).toLocaleString()}</strong><br><span style="color: #EF4444; font-weight: 700;">(เกินโควตามา ฿${Math.round(overAmount).toLocaleString()} แล้ว)</span>`;
        modal.classList.add('active');
      }
    }
  }

  hideOverBudgetModal() {
    const modal = document.querySelector('#over-budget-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  render() {
    this.renderDashboard();
    this.renderExpenseList();
    this.renderCalendar();
    this.renderProgressBar();
  }

  renderDashboard() {
    const balanceEl = document.querySelector('#current-balance');
    const todayRemainingEl = document.querySelector('#today-remaining');
    const todaySpentEl = document.querySelector('#today-spent');

    if (balanceEl) {
      balanceEl.textContent = `฿${this.#account.getCurrentBalance().toLocaleString()}`;
    }
    if (todayRemainingEl) {
      const remaining = this.#analyzer.getTodayRemainingAllowance();
      todayRemainingEl.textContent = `฿${Math.round(remaining).toLocaleString()}`;
    }
    if (todaySpentEl) {
      const spent = this.#analyzer.getTodaySpent();
      todaySpentEl.textContent = `฿${Math.round(spent).toLocaleString()}`;
    }
  }

  // 🎨 อัปเกรดส่วนแสดงรายการใช้จ่าย (รวม Empty State และปุ่มลบ)
  renderExpenseList() {
    const listContainer = document.querySelector('#expense-list') || document.querySelector('#transaction-list');
    if (!listContainer) return;

    const expenses = this.#analyzer.getExpenses();

    // กรณีไม่มีรายการ (Empty State)
    if (expenses.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 24px 16px; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 12px;">
          <div style="font-size: 2rem; margin-bottom: 6px;">🛒</div>
          <div style="color: #94a3b8; font-size: 0.9rem;">ยังไม่มีรายการใช้จ่าย</div>
        </div>
      `;
      return;
    }

    // มีรายการใช้จ่าย ให้เรนเดอร์ย้อนหลังจากล่าสุดขึ้นก่อน
    const reversedExpenses = [...expenses].reverse();
    const originalIndexes = expenses.map((_, idx) => idx).reverse();

    listContainer.innerHTML = reversedExpenses.map((exp, i) => {
      const badge = exp.getCategoryBadge ? exp.getCategoryBadge() : { icon: '💸' };
      const note = exp.getNote ? exp.getNote() : 'รายการใช้จ่าย';
      const amount = exp.getAmount ? exp.getAmount() : 0;
      const originalIndex = originalIndexes[i];

      return `
        <div class="transaction-item" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; margin-bottom: 8px; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${badge.icon}</span>
            <span style="font-weight: 500; color: #334155; font-size: 0.95rem;">${note}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <strong style="color: #EF4444; font-size: 0.95rem;">-฿${amount.toLocaleString()}</strong>
            <button class="delete-btn" data-index="${originalIndex}" style="background: none; border: none; cursor: pointer; opacity: 0.6; font-size: 0.9rem;" title="ลบรายการ">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // ผูก Event ปุ่มลบรายการ
    this.bindDeleteEvents(listContainer);
  }

  bindDeleteEvents(container) {
    const deleteButtons = container.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
          if (typeof this.#analyzer.removeExpense === 'function') {
            this.#analyzer.removeExpense(index);
          } else if (typeof this.#account.removeExpense === 'function') {
            this.#account.removeExpense(index);
          }
          this.render(); // เรนเดอร์ UI คำนวณยอดเงินใหม่ทั้งหมด
        }
      });
    });
  }

  renderCalendar() {
    const calendarContainer = document.querySelector('#calendar-grid');
    if (!calendarContainer) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    const dailyCategories = this.#analyzer.getDailyCategorySummary();
    const expensesByDate = this.#analyzer.getExpensesByDateMap();

    const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
    let html = dayNames.map(name => `<div class="day-name">${name}</div>`).join('');

    for (let i = 0; i < firstDay; i++) {
      html += `<div class="day-cell empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today ? 'today' : '';
      
      const formattedMonth = String(month + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
      
      const categories = dailyCategories[dateStr] || new Set();
      const dayExpenses = expensesByDate[dateStr] || [];

      let dotsHtml = '';
      if (categories.has('ESSENTIAL')) dotsHtml += `<span class="dot green"></span>`;
      if (categories.has('REWARD')) dotsHtml += `<span class="dot yellow"></span>`;
      if (categories.has('IMPULSE')) dotsHtml += `<span class="dot red"></span>`;

      let tooltipHtml = '';
      if (dayExpenses.length > 0) {
        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.getAmount(), 0);
        const itemsList = dayExpenses.map(e => {
          const badge = e.getCategoryBadge();
          return `<div class="tooltip-item"><span>${badge.icon} ${e.getNote()}</span><strong>฿${e.getAmount().toLocaleString()}</strong></div>`;
        }).join('');

        tooltipHtml = `
          <div class="calendar-tooltip">
            <div class="tooltip-header">
              <span>วันที่ ${day}</span>
              <strong>รวม ฿${dayTotal.toLocaleString()}</strong>
            </div>
            <div class="tooltip-body">${itemsList}</div>
          </div>
        `;
      } else {
        tooltipHtml = `
          <div class="calendar-tooltip">
            <div class="tooltip-header"><span>วันที่ ${day}</span></div>
            <div class="tooltip-body" style="color: #94A3B8; font-size: 0.75rem;">ไม่มีรายการใช้จ่าย</div>
          </div>
        `;
      }

      html += `
        <div class="day-cell ${isToday}">
          <span>${day}</span>
          <div class="dots">${dotsHtml}</div>
          ${tooltipHtml}
        </div>
      `;
    }

    calendarContainer.innerHTML = html;
  }

  showCustomAlert(title, message, icon = '🎉') {
    const modal = document.querySelector('#custom-alert-modal');
    const titleEl = document.querySelector('#custom-alert-title');
    const msgEl = document.querySelector('#custom-alert-message');
    const iconEl = document.querySelector('#custom-alert-icon');
    const closeBtn = document.querySelector('#custom-alert-btn');

    if (!modal || !titleEl || !msgEl) return;

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    if (iconEl) iconEl.textContent = icon;

    modal.classList.add('active');

    const handleClose = () => {
      modal.classList.remove('active');
      closeBtn.removeEventListener('click', handleClose);
    };
    closeBtn.addEventListener('click', handleClose);
  }

  renderProgressBar() {
    const now = new Date();
    const currentDay = now.getDate();
    
    const dailyBase = this.#account.getBaseDailyAllowance();
    const accumulatedBudget = dailyBase * currentDay;

    if (accumulatedBudget <= 0) return;

    const essentialSpent = this.#analyzer.getTotalSpentByLevel('ESSENTIAL');
    const rewardSpent = this.#analyzer.getTotalSpentByLevel('REWARD');
    const impulseSpent = this.#analyzer.getTotalSpentByLevel('IMPULSE');

    const totalSpent = essentialSpent + rewardSpent + impulseSpent;
    const totalPct = Math.round((totalSpent / accumulatedBudget) * 100);

    const scale = totalSpent > accumulatedBudget ? (accumulatedBudget / totalSpent) : 1;
    
    const pctEssential = (essentialSpent / accumulatedBudget) * 100 * scale;
    const pctReward = (rewardSpent / accumulatedBudget) * 100 * scale;
    const pctImpulse = (impulseSpent / accumulatedBudget) * 100 * scale;

    const barEssential = document.querySelector('#bar-essential');
    const barReward = document.querySelector('#bar-reward');
    const barImpulse = document.querySelector('#bar-impulse');

    if (barEssential) barEssential.style.width = `${pctEssential}%`;
    if (barReward) barReward.style.width = `${pctReward}%`;
    if (barImpulse) barImpulse.style.width = `${pctImpulse}%`;

    const txtPercent = document.querySelector('#progress-percent-text');
    if (txtPercent) txtPercent.textContent = `${totalPct}% ของงบสะสมถึงวันนี้`;

    const elPctEssential = document.querySelector('#pct-essential');
    const elPctReward = document.querySelector('#pct-reward');
    const elPctImpulse = document.querySelector('#pct-impulse');

    if (elPctEssential) elPctEssential.textContent = `${Math.round((essentialSpent / accumulatedBudget) * 100)}%`;
    if (elPctReward) elPctReward.textContent = `${Math.round((rewardSpent / accumulatedBudget) * 100)}%`;
    if (elPctImpulse) elPctImpulse.textContent = `${Math.round((impulseSpent / accumulatedBudget) * 100)}%`;
  }
  bindDeleteEvents(container) {
    const deleteButtons = container.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        
        // ดึงข้อมูลรายการที่จะลบมาแสดงในข้อความแจ้งเตือน
        const expenses = this.#analyzer.getExpenses();
        const targetExpense = expenses[index];
        const note = targetExpense ? targetExpense.getNote() : 'รายการนี้';
        const amount = targetExpense ? targetExpense.getAmount() : 0;

        // ลบรายการและบันทึกข้อมูล
        if (typeof this.#analyzer.removeExpense === 'function') {
          this.#analyzer.removeExpense(index);
          this.render(); // อัปเดตหน้าจอทันที

          // แสดง Modal แจ้งเตือนสวยๆ ตรงกลางจอ
          this.showCustomAlert(
            'ลบรายการสำเร็จ!',
            `ลบรายการ "<strong>${note}</strong>" (฿${amount.toLocaleString()}) คืนยอดเงินเข้ากระเป๋าเรียบร้อยแล้ว`,
            '🗑️'
          );
        }
      });
    });
  }
}
