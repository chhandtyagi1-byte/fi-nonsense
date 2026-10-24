/**
 * BROKEZILLA - The Savage Pixelated Financial Dino Chatbot (Indian Rupees Edition ₹)
 * Handles conversation, habit extraction, hilarious Indian context roasts, and dynamic budget advice.
 */

class BrokezillaAI {
  constructor() {
    this.name = "Brokezilla";
    this.habits = []; // Extracted custom daily habits in INR
    this.avatarEl = document.getElementById('brokezilla-avatar');
    this.moodEl = document.getElementById('dino-mood');
    this.chatContainer = document.getElementById('chat-messages');
    this.isSpeaking = false;
  }

  // Set Dino Face Emotion & Mood
  setMood(mood, statusText) {
    this.avatarEl = this.avatarEl || document.getElementById('brokezilla-avatar');
    this.moodEl = this.moodEl || document.getElementById('dino-mood');
    if (!this.avatarEl) return;
    this.avatarEl.classList.remove('neutral', 'talking', 'roasting', 'shocked');
    this.avatarEl.classList.add(mood);
    if (this.moodEl && statusText) {
      this.moodEl.textContent = `MOOD: ${statusText.toUpperCase()}`;
    }
  }

  // Typewriter text generator with authentic 8-bit sound blips
  async speakMessage(text, isRoast = false, customBadge = null) {
    this.chatContainer = this.chatContainer || document.getElementById('chat-messages');
    if (!this.chatContainer) return;

    this.setMood(isRoast ? 'roasting' : 'talking', isRoast ? 'SAVAGE ROAST MODE 🔥' : 'LECTURING MORTAL 🦖');
    if (isRoast && window.soundFX) {
      window.soundFX.playRoar();
    }

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble brokezilla-msg ${isRoast ? 'roast-highlight' : ''}`;
    
    const sender = document.createElement('span');
    sender.className = 'sender-label';
    sender.textContent = isRoast ? '🦖 BROKEZILLA [ROAST CANNON]:' : '🦖 BROKEZILLA:';
    bubble.appendChild(sender);

    const messageContent = document.createElement('span');
    messageContent.className = 'msg-body';
    bubble.appendChild(messageContent);

    if (customBadge) {
      const badge = document.createElement('div');
      badge.className = 'habit-detected-badge';
      badge.innerHTML = customBadge;
      bubble.appendChild(badge);
    }

    this.chatContainer.appendChild(bubble);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

    // Typewriter effect
    this.isSpeaking = true;
    let currentIdx = 0;
    
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (currentIdx < text.length) {
          messageContent.textContent += text[currentIdx];
          currentIdx++;
          if (currentIdx % 3 === 0 && window.soundFX) {
            window.soundFX.playSpeechBlip();
          }
          this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        } else {
          clearInterval(interval);
          this.isSpeaking = false;
          setTimeout(() => {
            this.setMood('neutral', 'WATCHING YOUR WALLET 👁️');
          }, 1200);
          resolve();
        }
      }, 14);
    });
  }

  // Display User Message
  addUserMessage(text) {
    if (!this.chatContainer) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user-msg';
    
    const sender = document.createElement('span');
    sender.className = 'sender-label';
    sender.textContent = 'YOU (FINANCIAL RECKLESS):';
    bubble.appendChild(sender);

    const messageContent = document.createElement('span');
    messageContent.className = 'msg-body';
    messageContent.textContent = text;
    bubble.appendChild(messageContent);

    this.chatContainer.appendChild(bubble);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    if (window.soundFX) window.soundFX.playClick();
  }

  // Initial Welcome & Instructions
  async sendWelcome() {
    await this.speakMessage(
      "ROOOOAR! 🦖 I am BROKEZILLA, ruler of the financial apocalypse! Here is how we prevent you from surviving on plain Maggi and Parle-G at month end:"
    );
    await this.speakMessage(
      "1️⃣ STEP 1 on the left: Pick if you want to track this calendar month or a fresh 30-day survival sprint.\n" +
      "2️⃣ STEP 2: Enter your total monthly budget in Rupees (₹).\n" +
      "3️⃣ STEP 3: Add fixed bills (rent, wifi, gym, OTT).\n" +
      "4️⃣ TALK TO ME: Tell me your daily habits like buying ₹20 water bottles or iced coffee, and I will build your Rupee survival roadmap!"
    );
  }

  // Reactive feedback on monthly budget input in Indian Rupees
  evaluateBudget(budget) {
    if (budget <= 0) {
      return this.speakMessage("Zero Rupees?! Are you planning to feed on atmospheric humidity and photosynthesis?! Enter a real number!", true);
    }
    if (budget < 4000) {
      return this.speakMessage(
        `WAIT. ₹${budget.toLocaleString('en-IN')}?! For an ENTIRE MONTH?! That is so less, how are you even surviving on that?! Bro are you living on Parle-G and tap water?! One auto ride and your financial empire is finished!`,
        true
      );
    }
    if (budget < 12000) {
      return this.speakMessage(
        `₹${budget.toLocaleString('en-IN')}? Classic broke student / college survivor tier. Listen closely: if you buy ONE fancy cold coffee or order Zomato, your financial world will collapse like a stale samosa!`,
        false
      );
    }
    if (budget < 45000) {
      return this.speakMessage(
        `₹${budget.toLocaleString('en-IN')} is a solid monthly budget! But humans love squandering money on useless shiny garbage and midnight Swiggy orders. Let's lock in your daily spending cap!`,
        false
      );
    }
    if (budget < 120000) {
      return this.speakMessage(
        `₹${budget.toLocaleString('en-IN')}! Look at Ambani Jr. over here! Don't let your friends find out or they will suddenly 'forget their UPI pin' whenever the restaurant bill arrives!`,
        false
      );
    }
    return this.speakMessage(
      `₹${budget.toLocaleString('en-IN')}?! ROAR! Brokezilla demands tribute! With that much cash, if you end up broke at month end, I will personally come stomping on your apartment!`,
      false
    );
  }

  // Fixed bill reaction
  evaluateBill(name, cost) {
    if (cost > 15000) {
      this.speakMessage(`Holy prehistoric fossils! ₹${cost.toLocaleString('en-IN')} for ${name}?! That bill is heavier than my foot stomp!`, true);
    } else if (name.toLowerCase().includes('netflix') || name.toLowerCase().includes('hotstar') || name.toLowerCase().includes('spotify') || name.toLowerCase().includes('ott')) {
      this.speakMessage(`Added ₹${cost.toLocaleString('en-IN')} for ${name}. If you are not sharing that password with 4 cousins to split the cost, you are donating free money to tech CEOs!`, false);
    } else if (name.toLowerCase().includes('gym')) {
      this.speakMessage(`₹${cost.toLocaleString('en-IN')} for gym. Be honest mortal... do you actually lift weights, or are you just paying monthly rent for a locker you visit once a month?`, false);
    } else {
      this.speakMessage(`Noted: ₹${cost.toLocaleString('en-IN')} for ${name}. Mandatory survival bill locked into the system.`, false);
    }
  }

  // Natural Language Chat Parser & Habit Ingestion (INR)
  async processUserMessage(rawText, state) {
    const text = rawText.toLowerCase().trim();
    this.addUserMessage(rawText);

    // 1. Water bottle daily habit (explicitly asked by user!)
    if (text.includes('water bottle') || text.includes('water') && text.includes('bottle') || text.includes('bisleri') || text.includes('aquafina')) {
      const dailyCost = 20; // ₹20 Bisleri bottle
      const monthlyCost = Math.round(dailyCost * 30); // ₹600/mo
      const existing = this.habits.find(h => h.name.includes('Water'));
      if (!existing) {
        this.habits.push({ name: 'Daily Water Bottle (Bisleri)', cost: monthlyCost, daily: dailyCost });
      }

      await this.speakMessage(
        `A ₹20 WATER BOTTLE EVERY SINGLE DAY?! 💧 ROAR! Are you allergic to home water filters and Milton bottles?! That's ₹20 every day = ₹${monthlyCost.toLocaleString('en-IN')} a month thrown straight into plastic landfills! Buy a steel bottle from home, you reckless dinosaur!`,
        true,
        `⚡ ROADMAP UPDATED: +₹${monthlyCost}/mo added to College/Travel Outflow`
      );
      if (window.app) window.app.updateCustomRoadmap();
      return;
    }

    // 2. Chai / Coffee / Cold coffee / Cafe habit
    if (text.includes('coffee') || text.includes('chai') || text.includes('tea') || text.includes('starbucks') || text.includes('cafe') || text.includes('tapri') || text.includes('cutting')) {
      const dailyCost = 50;
      const monthlyCost = Math.round(dailyCost * 26); // ₹1,300/mo
      this.habits.push({ name: 'Daily Chai & Coffee', cost: monthlyCost, daily: dailyCost });

      await this.speakMessage(
        `Chai & bean juice addiction detected! ☕ You are paying daily for caffeine rush that steals ~₹${monthlyCost.toLocaleString('en-IN')} from your survival stash every month! Brokezilla factored this into your daily allowance.`,
        true,
        `⚡ ROADMAP UPDATED: +₹${monthlyCost}/mo allocated to Food/Caffeine`
      );
      if (window.app) window.app.updateCustomRoadmap();
      return;
    }

    // 3. Friends / Hangout / Weekend party / Drinks / Beer
    if (text.includes('friend') || text.includes('hangout') || text.includes('party') || text.includes('club') || text.includes('beer') || text.includes('drinks') || text.includes('weekend')) {
      const monthlyCost = 2500;
      this.habits.push({ name: 'Friends & Socializing', cost: monthlyCost, daily: 85 });

      await this.speakMessage(
        `"Bro, let's just meet for 10 minutes" — FAMOUS LAST WORDS OF A BROKE SOUL! 🍻 Your friends are stealth vampires draining your UPI balance! I am putting a strict ₹${monthlyCost.toLocaleString('en-IN')}/month Friend Shield on your roadmap. When that hits zero, you switch your phone to airplane mode!`,
        true,
        `⚡ ROADMAP UPDATED: Social Outflow Capped at ₹${monthlyCost.toLocaleString('en-IN')}/mo`
      );
      if (window.app) window.app.updateCustomRoadmap();
      return;
    }

    // 4. Commute / Metro / Auto / Rapido / Bus / College / Train
    if (text.includes('college') || text.includes('commute') || text.includes('travel') || text.includes('metro') || text.includes('auto') || text.includes('bus') || text.includes('rapido') || text.includes('ola') || text.includes('uber')) {
      const travelCost = 1500;
      this.habits.push({ name: 'Daily Metro / Auto Commute', cost: travelCost, daily: 50 });

      await this.speakMessage(
        `College & daily commute noted! 🚌 Auto meters run faster than Usain Bolt, so I factored ₹${travelCost.toLocaleString('en-IN')}/month into your travel roadmap so you don't end up stranded at a metro station!`,
        false,
        `⚡ ROADMAP UPDATED: +₹${travelCost.toLocaleString('en-IN')}/mo to Travel & Commute`
      );
      if (window.app) window.app.updateCustomRoadmap();
      return;
    }

    // 5. Direct Roast Request
    if (text.includes('roast') || text.includes('joke') || text.includes('funny')) {
      const roasts = [
        "Your bank balance looks like the temperature in Siachen glacier right now.",
        "You look at a ₹350 gourmet burger on Swiggy and say 'self-care'. That is not self-care, that is self-sabotage!",
        "Your financial strategy is literally 'main kal se pakka paise bachaunga' every single night.",
        "If wasting money was an Olympic sport, you would have won gold and then accidentally tipped the referee your rent money."
      ];
      const pick = roasts[Math.floor(Math.random() * roasts.length)];
      await this.speakMessage(pick, true);
      return;
    }

    // 6. Food Delivery / Swiggy / Zomato
    if (text.includes('order') || text.includes('swiggy') || text.includes('zomato') || text.includes('takeout') || text.includes('pizza') || text.includes('burger')) {
      await this.speakMessage(
        `Swiggy & Zomato delivery charges are Brokezilla's mortal enemy! 🍔 You pay ₹180 for food, ₹40 delivery fee, ₹15 platform fee, and ₹30 GST! Learn to make dal-chawal before I eat your kitchen!`,
        true
      );
      return;
    }

    // 7. General inquiry
    const genericReplies = [
      `I hear you! Added that into my prehistoric memory bank. Hit 'BUILD MY 1-MONTH SURVIVAL ROADMAP' on the left when you are ready!`,
      `Interesting! But remember: Every 100 Rupees you blow on impulse buys is a meal you won't have in week 4. Keep your discipline!`,
      `ROAR! 🦖 I'm analyzing that against your Rupee survival timeline. Tell me more or generate your plan!`,
      `Understood! Brokezilla calculates this will directly impact your month-end starvation meter. Keep your guard up!`
    ];
    await this.speakMessage(genericReplies[Math.floor(Math.random() * genericReplies.length)], false);
  }

  // Reaction to Nightly Spending Log (INR)
  reactToExpense(amount, category, description, dailyCap, remainingDaily) {
    if (amount > dailyCap * 2) {
      if (window.soundFX) window.soundFX.playRoastAlarm();
      this.setMood('roasting', 'RAGING OVERSPEND ALERT 🔥');
      return {
        speech: `OMG ARE YOU DUMB?! 😱 Why would you spend ₹${amount.toLocaleString('en-IN')} in a SINGLE NIGHT?! You were supposed to spend under ₹${Math.round(dailyCap).toLocaleString('en-IN')}/day! Brokezilla detected catastrophic damage to your wallet. You are now rationed to ₹${Math.max(0, Math.round(remainingDaily)).toLocaleString('en-IN')}/day! Enjoy plain boiled rice!`,
        isRoast: true,
        starveImpact: 'critical'
      };
    } else if (category.includes('Friends') || description.toLowerCase().includes('friend') || description.toLowerCase().includes('party') || description.toLowerCase().includes('chai')) {
      return {
        speech: `₹${amount.toLocaleString('en-IN')} on "${description}"?! 🍻 Your friends strike again! Tell them Brokezilla has locked your UPI apps until next week!`,
        isRoast: true,
        starveImpact: 'warning'
      };
    } else if (amount <= dailyCap) {
      if (window.soundFX) window.soundFX.playSuccess();
      return {
        speech: `Wait... you spent ₹${amount.toLocaleString('en-IN')} which is UNDER your ₹${Math.round(dailyCap).toLocaleString('en-IN')} cap?! 🦖 I am genuinely shocked! You actually listened to me! Starvation risk delayed by another day. Keep this up and you will survive the month!`,
        isRoast: false,
        starveImpact: 'safe'
      };
    } else {
      return {
        speech: `Logged ₹${amount.toLocaleString('en-IN')} for "${description}". A bit over your ₹${Math.round(dailyCap).toLocaleString('en-IN')} target, but you haven't destroyed the entire plan yet. Stay vigilant tomorrow!`,
        isRoast: false,
        starveImpact: 'warning'
      };
    }
  }
}

window.BrokezillaAI = BrokezillaAI;
