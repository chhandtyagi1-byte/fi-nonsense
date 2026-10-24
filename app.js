/**
 * FI-NONSENSE MAIN APPLICATION CONTROLLER (Indian Rupees Edition ₹)
 * Coordinates Hero Physics, Brokezilla AI, Roadmap Calculations, and Nightly Tracking in INR.
 */

class FiNonsenseApp {
  constructor() {
    this.state = {
      trackingMode: 'calendar', // 'calendar' or 'custom'
      totalBudget: 0,
      fixedBills: [
        { id: 1, name: 'PG / Room Rent', cost: 8000 },
        { id: 2, name: 'WiFi & Mobile Recharge', cost: 799 }
      ],
      expenses: [],
      daysRemaining: 8,
      totalDays: 8,
      starvationHealth: 100, // 0 to 100%
      customHabits: []
    };

    this.physics = null;
    this.dino = null;
    this.storageKey = 'fi_nonsense_inr_v2_save';

    this.init();
  }

  formatINR(num) {
    if (isNaN(num)) return '₹0';
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  init() {
    this.loadState();
    this.initDateMetrics();
    this.setupScreens();
    this.setupAudioAndCRT();
    this.setupInputs();
    this.setupBills();
    this.setupChat();
    this.setupNightlyLogger();

    // Initialize Physics on Money Canvas with large Rupee coins & notes
    if (window.MoneyPhysicsEngine) {
      this.physics = new MoneyPhysicsEngine('money-canvas');
    }

    // Initialize Brokezilla AI
    if (window.BrokezillaAI) {
      this.dino = new BrokezillaAI();
      setTimeout(() => {
        if (this.dino) this.dino.sendWelcome();
      }, 500);
    }

    this.renderBillsList();
    this.checkRoadmapReadiness();
  }

  // Load from LocalStorage
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load saved data', e);
    }
  }

  // Save to LocalStorage
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save data', e);
    }
  }

  // Calculate days for Calendar Month vs Custom 30-Day
  initDateMetrics() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeftInCalendar = (totalDaysInMonth - currentDate) + 1;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[currentMonth];

    const calendarDesc = document.getElementById('calendar-mode-desc');
    const dateBadge = document.getElementById('date-preview-badge');

    if (this.state.trackingMode === 'calendar') {
      this.state.daysRemaining = Math.max(1, daysLeftInCalendar);
      this.state.totalDays = totalDaysInMonth;
      if (calendarDesc) calendarDesc.textContent = `Current: ${monthName} ${currentDate} to ${monthName} ${totalDaysInMonth} (${daysLeftInCalendar} days remaining)`;
      if (dateBadge) dateBadge.textContent = `Active Period: ${monthName} ${currentDate} to ${monthName} ${totalDaysInMonth} (${daysLeftInCalendar} days left)`;
    } else {
      this.state.daysRemaining = 30;
      this.state.totalDays = 30;
      if (dateBadge) dateBadge.textContent = `Active Period: Day 1 to Day 30 (Full 30-Day Sprint)`;
    }

    this.populateNightlyDays();
  }

  populateNightlyDays() {
    const select = document.getElementById('expense-day-select');
    if (!select) return;
    select.innerHTML = '';

    const count = this.state.trackingMode === 'calendar' ? this.state.daysRemaining : 30;
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const opt = document.createElement('option');
      if (this.state.trackingMode === 'calendar') {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        opt.value = `Day ${i + 1} (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
        opt.textContent = `Day ${i + 1} (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      } else {
        opt.value = `Day ${i + 1} of 30`;
        opt.textContent = `Day ${i + 1} of 30`;
      }
      select.appendChild(opt);
    }
  }

  // Navigation Between Screens
  setupScreens() {
    const heroSec = document.getElementById('hero-section');
    const trackSec = document.getElementById('tracking-section');
    const roadSec = document.getElementById('roadmap-section');

    const startBtn = document.getElementById('start-tracking-btn');
    const backHomeBtn = document.getElementById('back-to-home-btn');
    const viewPlanBtn = document.getElementById('view-plan-btn');
    const generateRoadmapBtn = document.getElementById('generate-roadmap-btn');
    const backSetupBtn = document.getElementById('back-to-setup-btn');
    const resetBtn = document.getElementById('reset-data-btn');

    const showScreen = (target) => {
      [heroSec, trackSec, roadSec].forEach(s => s.classList.remove('active'));
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.soundFX) window.soundFX.playClick();
    };

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        showScreen(trackSec);
        if (window.soundFX) window.soundFX.playSuccess();
      });
    }

    if (backHomeBtn) {
      backHomeBtn.addEventListener('click', () => showScreen(heroSec));
    }

    if (viewPlanBtn) {
      viewPlanBtn.addEventListener('click', () => {
        this.renderRoadmap();
        showScreen(roadSec);
      });
    }

    if (generateRoadmapBtn) {
      generateRoadmapBtn.addEventListener('click', () => {
        this.renderRoadmap();
        showScreen(roadSec);
        if (viewPlanBtn) viewPlanBtn.style.display = 'inline-flex';
        if (window.soundFX) window.soundFX.playSuccess();
      });
    }

    if (backSetupBtn) {
      backSetupBtn.addEventListener('click', () => showScreen(trackSec));
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Reset all your Rupee budget and spending logs? Brokezilla won't be mad, just disappointed.")) {
          localStorage.removeItem(this.storageKey);
          location.reload();
        }
      });
    }
  }

  // Audio Toggle & CRT Scanline Toggle
  setupAudioAndCRT() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (window.soundFX) {
          const isMuted = window.soundFX.toggleMute();
          audioBtn.querySelector('.sound-icon').textContent = isMuted ? '🔇' : '🔊';
          audioBtn.querySelector('.sound-text').textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
        }
      });
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('crt-off');
        const isOff = document.body.classList.contains('crt-off');
        themeBtn.querySelector('span').textContent = isOff ? '📺 CRT: OFF' : '📺 CRT: ON';
        if (window.soundFX) window.soundFX.playClick();
      });
    }
  }

  // Budget & Mode inputs
  setupInputs() {
    const budgetInput = document.getElementById('monthly-budget-input');
    const confirmBtn = document.getElementById('confirm-budget-btn');

    const updateActiveBudgetBanner = () => {
      const banner = document.getElementById('active-budget-display');
      const amountEl = document.getElementById('active-budget-amount');
      if (this.state.totalBudget > 0 && banner && amountEl) {
        amountEl.textContent = this.formatINR(this.state.totalBudget);
        banner.style.display = 'flex';
      }
    };

    if (this.state.totalBudget > 0 && budgetInput) {
      budgetInput.value = this.state.totalBudget;
      updateActiveBudgetBanner();
    }

    const handleConfirmBudget = () => {
      const val = parseFloat(budgetInput.value);
      if (isNaN(val) || val <= 0) {
        if (this.dino) this.dino.evaluateBudget(0);
        return;
      }
      this.state.totalBudget = val;
      this.saveState();
      this.checkRoadmapReadiness();
      updateActiveBudgetBanner();
      if (this.dino) this.dino.evaluateBudget(val);
      if (window.soundFX) window.soundFX.playMetalCoin();
    };

    if (confirmBtn) confirmBtn.addEventListener('click', handleConfirmBudget);
    if (budgetInput) {
      budgetInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleConfirmBudget();
      });
    }

    // Quick Budget Presets
    const presetPills = document.querySelectorAll('.budget-preset-pill');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const amount = parseFloat(pill.getAttribute('data-amount'));
        if (budgetInput) budgetInput.value = amount;
        handleConfirmBudget();
      });
    });

    const labelCal = document.getElementById('label-mode-calendar');
    const labelCust = document.getElementById('label-mode-custom');
    const radios = document.querySelectorAll('input[name="tracking-mode"]');

    radios.forEach(radio => {
      if (radio.value === this.state.trackingMode) {
        radio.checked = true;
        if (radio.value === 'calendar') {
          labelCal.classList.add('active');
          labelCust.classList.remove('active');
        } else {
          labelCust.classList.add('active');
          labelCal.classList.remove('active');
        }
      }

      radio.addEventListener('change', (e) => {
        this.state.trackingMode = e.target.value;
        radios.forEach(r => r.closest('.pixel-radio-label').classList.remove('active'));
        e.target.closest('.pixel-radio-label').classList.add('active');
        this.initDateMetrics();
        this.saveState();
        if (window.soundFX) window.soundFX.playClick();
        if (this.dino) {
          const modeName = this.state.trackingMode === 'calendar' ? "Calendar Month" : "Custom 30-Day Sprint";
          this.dino.speakMessage(`Switched timeline to ${modeName}! Your Rupee starvation clock has been recalibrated.`);
        }
      });
    });
  }

  // Fixed Bills management & presets
  setupBills() {
    const addBtn = document.getElementById('add-bill-btn');
    const nameInput = document.getElementById('bill-name-input');
    const amountInput = document.getElementById('bill-amount-input');
    const presets = document.querySelectorAll('.preset-pill');

    const addBill = (name, cost) => {
      if (!name || isNaN(cost) || cost <= 0) return;
      this.state.fixedBills.push({
        id: Date.now() + Math.random(),
        name: name,
        cost: cost
      });
      this.saveState();
      this.renderBillsList();
      if (this.dino) this.dino.evaluateBill(name, cost);
      if (window.soundFX) window.soundFX.playClick();
    };

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const cost = parseFloat(amountInput.value);
        if (name && cost > 0) {
          addBill(name, cost);
          nameInput.value = '';
          amountInput.value = '';
        }
      });
    }

    presets.forEach(p => {
      p.addEventListener('click', () => {
        const name = p.getAttribute('data-name');
        const cost = parseFloat(p.getAttribute('data-cost'));
        addBill(name, cost);
      });
    });
  }

  renderBillsList() {
    const container = document.getElementById('bills-list-container');
    const totalEl = document.getElementById('fixed-bills-total');
    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    if (this.state.fixedBills.length === 0) {
      container.innerHTML = '<div class="empty-bills-note">No fixed bills added yet. Add some or tell Brokezilla!</div>';
    } else {
      this.state.fixedBills.forEach(bill => {
        total += bill.cost;
        const row = document.createElement('div');
        row.className = 'bill-item-row';
        row.innerHTML = `
          <span class="bill-item-name">${bill.name}</span>
          <div>
            <span class="bill-item-cost">${this.formatINR(bill.cost)}</span>
            <button class="bill-delete-btn" data-id="${bill.id}" title="Delete bill">❌</button>
          </div>
        `;
        container.appendChild(row);
      });
    }

    if (totalEl) totalEl.textContent = this.formatINR(total);

    container.querySelectorAll('.bill-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseFloat(e.target.getAttribute('data-id'));
        this.state.fixedBills = this.state.fixedBills.filter(b => b.id !== id);
        this.saveState();
        this.renderBillsList();
        if (window.soundFX) window.soundFX.playClick();
      });
    });

    this.checkRoadmapReadiness();
  }

  checkRoadmapReadiness() {
    const btn = document.getElementById('generate-roadmap-btn');
    const hint = document.getElementById('roadmap-trigger-hint');
    const viewBtn = document.getElementById('view-plan-btn');

    if (this.state.totalBudget > 0) {
      if (btn) btn.disabled = false;
      if (hint) hint.textContent = '✅ All set! Click above to see your customized 1-month Rupee survival plan.';
      if (viewBtn) viewBtn.style.display = 'inline-flex';
    } else {
      if (btn) btn.disabled = true;
      if (hint) hint.textContent = 'Enter your monthly budget above or chat with Brokezilla to unlock your roadmap!';
    }
  }

  // Brokezilla Chat triggers & Quick Prompts
  setupChat() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const quickPrompts = document.querySelectorAll('.quick-btn');

    const handleSend = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      if (this.dino) {
        this.dino.processUserMessage(text, this.state);
      }
    };

    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    quickPrompts.forEach(qb => {
      qb.addEventListener('click', () => {
        const text = qb.getAttribute('data-text');
        if (this.dino) this.dino.processUserMessage(text, this.state);
      });
    });
  }

  updateCustomRoadmap() {
    this.renderRoadmap();
  }

  renderRoadmap() {
    const totalBudget = this.state.totalBudget || 20000;
    const fixedTotal = this.state.fixedBills.reduce((acc, b) => acc + b.cost, 0);

    const dinoHabits = this.dino ? this.dino.habits : [];
    const discretionary = Math.max(0, totalBudget - fixedTotal);
    const savingsTarget = Math.round(discretionary * 0.20);
    const remainingForDaily = Math.max(0, discretionary - savingsTarget);

    const days = Math.max(1, this.state.daysRemaining);
    const dailyCap = remainingForDaily / days;

    // Overview Cards in INR
    const dispBudget = document.getElementById('disp-total-budget');
    const dispFixed = document.getElementById('disp-fixed-bills');
    const dispSavings = document.getElementById('disp-savings-goal');
    const dispCap = document.getElementById('disp-daily-cap');

    if (dispBudget) dispBudget.textContent = this.formatINR(totalBudget);
    if (dispFixed) dispFixed.textContent = this.formatINR(fixedTotal);
    if (dispSavings) dispSavings.textContent = this.formatINR(savingsTarget);
    if (dispCap) dispCap.textContent = `${this.formatINR(dailyCap)} / day`;

    // Category Breakdown in INR
    const foodAlloc = Math.round(remainingForDaily * 0.45);
    const travelAlloc = Math.round(remainingForDaily * 0.25);
    const socialAlloc = Math.round(remainingForDaily * 0.20);

    const categoriesContainer = document.getElementById('category-bars-container');
    if (categoriesContainer) {
      categoriesContainer.innerHTML = `
        <div class="category-bar-group">
          <div class="cat-header-row">
            <span>🍔 Food, Groceries & Daily Meals</span>
            <span class="cat-allocation-cost">${this.formatINR(foodAlloc)} (~${this.formatINR(foodAlloc / days)}/day)</span>
          </div>
          <div class="pixel-progress-track">
            <div class="pixel-progress-fill fill-food" style="width: 45%;"></div>
          </div>
        </div>

        <div class="category-bar-group">
          <div class="cat-header-row">
            <span>🚌 Metro, Auto, College Commute & Habits</span>
            <span class="cat-allocation-cost">${this.formatINR(travelAlloc)} (~${this.formatINR(travelAlloc / days)}/day)</span>
          </div>
          <div class="pixel-progress-track">
            <div class="pixel-progress-fill fill-travel" style="width: 25%;"></div>
          </div>
        </div>

        <div class="category-bar-group">
          <div class="cat-header-row">
            <span>🍻 Friends, Chai Tapri & Weekend Outings</span>
            <span class="cat-allocation-cost">${this.formatINR(socialAlloc)} (Max ${this.formatINR(socialAlloc)} total)</span>
          </div>
          <div class="pixel-progress-track">
            <div class="pixel-progress-fill fill-fun" style="width: 20%;"></div>
          </div>
        </div>

        <div class="category-bar-group">
          <div class="cat-header-row">
            <span>🧾 Fixed Outflow (PG, WiFi, OTT, EMIs)</span>
            <span class="cat-allocation-cost">${this.formatINR(fixedTotal)}</span>
          </div>
          <div class="pixel-progress-track">
            <div class="pixel-progress-fill fill-fixed" style="width: ${Math.min(100, Math.round((fixedTotal / totalBudget) * 100))}%;"></div>
          </div>
        </div>

        <div class="category-bar-group">
          <div class="cat-header-row">
            <span>🛡️ Locked Emergency Cushion & Savings</span>
            <span class="cat-allocation-cost">${this.formatINR(savingsTarget)}</span>
          </div>
          <div class="pixel-progress-track">
            <div class="pixel-progress-fill fill-savings" style="width: 20%;"></div>
          </div>
        </div>
      `;
    }

    // Overspending radar analysis in INR
    const alertBox = document.getElementById('overspending-alert-text');
    if (alertBox) {
      let warnings = [];
      if (fixedTotal > totalBudget * 0.65) {
        warnings.push(`⚠️ Fixed bills consume ${Math.round((fixedTotal / totalBudget) * 100)}% of your salary/budget! Rent & subs are suffocating your food money.`);
      }
      if (dailyCap < 150) {
        warnings.push(`🚨 CRITICAL DANGER: Your daily spend cap is under ₹150/day (${this.formatINR(dailyCap)}). You can barely afford 2 plates of street food! Do NOT order online!`);
      }
      dinoHabits.forEach(h => {
        if (h.name.includes('Water')) {
          warnings.push(`💧 Daily Bisleri water bottles cost you ${this.formatINR(h.cost)}/month. Carry a refillable steel bottle from home and save ${this.formatINR(h.cost)}!`);
        }
        if (h.name.includes('Chai') || h.name.includes('Coffee')) {
          warnings.push(`☕ Daily Chai & Coffee drains ${this.formatINR(h.cost)}/month. Make tea at home or Brokezilla will cry.`);
        }
        if (h.name.includes('Social') || h.name.includes('Friends')) {
          warnings.push(`🍻 Friends & Hangouts: You have a tendency to overspend when peer pressured. Stay firm on your budget!`);
        }
      });

      if (warnings.length > 0) {
        alertBox.innerHTML = warnings.join('<br><br>');
      } else {
        alertBox.textContent = `Looking solid! Keep your daily spending under ${this.formatINR(dailyCap)} and you will comfortably hit your ${this.formatINR(savingsTarget)} savings cushion.`;
      }
    }

    this.updateStarvationHealth();
    this.renderExpensesHistory();
  }

  // Nightly Expense Form & Recalculation
  setupNightlyLogger() {
    const logBtn = document.getElementById('log-expense-btn');
    const daySelect = document.getElementById('expense-day-select');
    const amountInput = document.getElementById('expense-amount-input');
    const catSelect = document.getElementById('expense-cat-select');
    const descInput = document.getElementById('expense-desc-input');

    if (logBtn) {
      logBtn.addEventListener('click', () => {
        const amount = parseFloat(amountInput.value);
        const day = daySelect.value;
        const category = catSelect.value;
        const desc = descInput.value.trim() || category;

        if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid Rupee expense amount!');
          return;
        }

        const expenseItem = {
          id: Date.now(),
          day: day,
          amount: amount,
          category: category,
          description: desc,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.state.expenses.unshift(expenseItem);
        this.saveState();

        const totalBudget = this.state.totalBudget || 20000;
        const fixedTotal = this.state.fixedBills.reduce((acc, b) => acc + b.cost, 0);
        const totalSpent = this.state.expenses.reduce((acc, e) => acc + e.amount, 0);
        const discretionary = Math.max(0, totalBudget - fixedTotal);
        const remainingMoney = Math.max(0, discretionary - totalSpent);
        const daysLeft = Math.max(1, this.state.daysRemaining - 1);
        const newDailyCap = remainingMoney / daysLeft;
        const baseCap = discretionary / this.state.daysRemaining;

        if (this.dino) {
          const reaction = this.dino.reactToExpense(amount, category, desc, baseCap, newDailyCap);
          const speechEl = document.getElementById('reaction-speech');
          if (speechEl) {
            speechEl.textContent = `"${reaction.speech}"`;
          }
          this.showToast(`🦖 Brokezilla: ${reaction.speech.substring(0, 80)}...`);
        }

        amountInput.value = '';
        descInput.value = '';

        this.renderRoadmap();
      });
    }
  }

  updateStarvationHealth() {
    const totalBudget = this.state.totalBudget || 20000;
    const fixedTotal = this.state.fixedBills.reduce((acc, b) => acc + b.cost, 0);
    const totalSpent = this.state.expenses.reduce((acc, e) => acc + e.amount, 0);
    const discretionary = Math.max(0, totalBudget - fixedTotal);

    let health = 100;
    if (discretionary > 0) {
      const spentRatio = totalSpent / discretionary;
      health = Math.max(0, Math.round((1 - spentRatio) * 100));
    }

    this.state.starvationHealth = health;

    const fillEl = document.getElementById('starve-meter-fill');
    const textEl = document.getElementById('starve-percentage');
    const flavorEl = document.getElementById('starve-flavor-text');
    const headerPill = document.getElementById('header-starve-pill');

    if (fillEl) {
      fillEl.style.width = `${health}%`;
      fillEl.classList.remove('warning', 'critical');
      if (health < 30) {
        fillEl.classList.add('critical');
      } else if (health < 65) {
        fillEl.classList.add('warning');
      }
    }

    if (textEl) {
      if (health >= 80) textEl.textContent = `THRIVING (${health}% SURVIVAL)`;
      else if (health >= 50) textEl.textContent = `RATIONING (${health}% SURVIVAL)`;
      else if (health >= 20) textEl.textContent = `CRITICAL HUNGER (${health}% SURVIVAL)`;
      else textEl.textContent = `EXTREME FAMINE (${health}% SURVIVAL)`;
    }

    if (flavorEl) {
      if (health >= 80) flavorEl.textContent = "Safe zone! You can still afford proper sabzi-roti and decent meals. Keep steady.";
      else if (health >= 50) flavorEl.textContent = "Warning: Margin of error shrinking. Put down the Swiggy / Zomato apps!";
      else if (health >= 20) flavorEl.textContent = "EMERGENCY: Prepare for plain Maggi and tap water until month end!";
      else flavorEl.textContent = "ROOOOAR! You blew the entire Rupee budget! Time to borrow from friends or call mummy!";
    }

    if (headerPill) {
      if (health < 40) {
        headerPill.className = 'starve-status-pill danger';
        headerPill.textContent = `🚨 STARVE RISK: HIGH (${health}%)`;
      } else {
        headerPill.className = 'starve-status-pill';
        headerPill.textContent = `🛡️ STARVE RISK: LOW (${health}%)`;
      }
    }
  }

  renderExpensesHistory() {
    const listEl = document.getElementById('expenses-history-list');
    const totalSpentEl = document.getElementById('history-total-spent');
    if (!listEl) return;

    listEl.innerHTML = '';
    const totalSpent = this.state.expenses.reduce((acc, e) => acc + e.amount, 0);
    if (totalSpentEl) totalSpentEl.textContent = `Total Spent: ${this.formatINR(totalSpent)}`;

    if (this.state.expenses.length === 0) {
      listEl.innerHTML = '<div class="empty-history-note">No expenses logged yet. Today is clean!</div>';
      return;
    }

    this.state.expenses.slice(0, 10).forEach(e => {
      const item = document.createElement('div');
      item.className = 'history-row-item';
      item.innerHTML = `
        <div class="history-item-left">
          <span class="history-item-date">${e.day} • ${e.date}</span>
          <span class="history-item-desc">${e.description} (${e.category})</span>
        </div>
        <div class="history-item-right">
          <span class="history-item-cost">-${this.formatINR(e.amount)}</span>
          <button class="bill-delete-btn" data-exp-id="${e.id}" title="Delete expense">❌</button>
        </div>
      `;
      listEl.appendChild(item);
    });

    listEl.querySelectorAll('.bill-delete-btn').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const id = parseFloat(ev.target.getAttribute('data-exp-id'));
        this.state.expenses = this.state.expenses.filter(x => x.id !== id);
        this.saveState();
        this.renderRoadmap();
        if (window.soundFX) window.soundFX.playClick();
      });
    });
  }

  showToast(msg) {
    const toast = document.getElementById('roast-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}

// Robust initialization whether DOM is loading or already ready
function startApp() {
  if (!window.app) {
    window.app = new FiNonsenseApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
