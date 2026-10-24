/**
 * fi-nonsense Interactive Canvas Physics - Indian Rupees (₹) Edition
 * Large, chunky Indian Rupee coins (₹10, ₹20, ₹5) and colorful currency notes (₹500, ₹200, ₹100, ₹50, ₹2000)
 * Realistic sounds: Metal clink for coins, paper flutter/rustle for notes!
 */

class MoneyPhysicsEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.items = [];
    this.particles = [];
    this.isDragging = false;
    this.draggedItem = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseVelocityX = 0;
    this.mouseVelocityY = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Generate large Indian Rupee coins and notes
    this.populateMoney();

    // Mouse and Touch Events
    this.setupInteractions();

    // Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.canvas.width = window.innerWidth || document.documentElement.clientWidth || 800;
    this.canvas.height = window.innerHeight || document.documentElement.clientHeight || 600;
  }

  populateMoney() {
    this.items = [];
    const count = Math.max(10, Math.min(Math.floor((this.canvas.width || 800) / 75), 18));

    const rupeeNotes = [
      { denom: 500, name: '₹500', color: '#5C715E', accent: '#7D9D85', border: '#2C3E30', textColor: '#E8F5E9' }, // Stone Grey / Olive Green
      { denom: 200, name: '₹200', color: '#F39C12', accent: '#F8C471', border: '#B7950B', textColor: '#FEF9E7' }, // Bright Saffron / Orange
      { denom: 100, name: '₹100', color: '#7D5BA6', accent: '#A58BC4', border: '#4A235A', textColor: '#F4ECF7' }, // Lavender / Violet
      { denom: 50,  name: '₹50',  color: '#00A8B5', accent: '#48DBFB', border: '#0B5345', textColor: '#E8F8F5' }, // Teal / Cyan
      { denom: 2000, name: '₹2000', color: '#D63031', accent: '#E84393', border: '#800020', textColor: '#FADBD8' } // Magenta Pink
    ];

    const rupeeCoins = [
      { denom: 20, name: '₹20', outerColor: '#F5B041', innerColor: '#EAEDED', bimetal: true }, // Bimetallic Gold/Silver
      { denom: 10, name: '₹10', outerColor: '#F4D03F', innerColor: '#BDC3C7', bimetal: true }, // Bimetallic
      { denom: 5,  name: '₹5',  outerColor: '#F1C40F', innerColor: '#D4AC0D', bimetal: false }  // Brass / Gold
    ];
    
    for (let i = 0; i < count; i++) {
      const isCoin = Math.random() > 0.45;
      const x = Math.random() * (this.canvas.width - 240) + 120;
      const y = Math.random() * (this.canvas.height - 240) + 100;
      
      if (isCoin) {
        const coinPreset = rupeeCoins[Math.floor(Math.random() * rupeeCoins.length)];
        this.items.push({
          type: 'coin',
          x: x,
          y: y,
          radius: 42 + Math.random() * 12, // Substantially bigger coins!
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.03,
          denom: coinPreset.denom,
          outerColor: coinPreset.outerColor,
          innerColor: coinPreset.innerColor,
          bimetal: coinPreset.bimetal
        });
      } else {
        const notePreset = rupeeNotes[Math.floor(Math.random() * rupeeNotes.length)];
        this.items.push({
          type: 'note',
          x: x,
          y: y,
          width: 155 + Math.random() * 25, // Large chunky Indian Rupee notes!
          height: 82 + Math.random() * 14,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.018,
          denom: notePreset.denom,
          color: notePreset.color,
          accent: notePreset.accent,
          border: notePreset.border,
          textColor: notePreset.textColor
        });
      }
    }
  }

  setupInteractions() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handlePointerDown = (e) => {
      const pos = getPos(e);
      this.lastMouseX = pos.x;
      this.lastMouseY = pos.y;

      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        let hit = false;

        if (item.type === 'coin') {
          const dx = pos.x - item.x;
          const dy = pos.y - item.y;
          hit = Math.sqrt(dx * dx + dy * dy) <= item.radius + 8;
        } else {
          hit = (
            pos.x >= item.x - item.width / 2 &&
            pos.x <= item.x + item.width / 2 &&
            pos.y >= item.y - item.height / 2 &&
            pos.y <= item.y + item.height / 2
          );
        }

        if (hit) {
          this.isDragging = true;
          this.draggedItem = item;
          this.dragOffsetX = pos.x - item.x;
          this.dragOffsetY = pos.y - item.y;

          // Move to top
          this.items.splice(i, 1);
          this.items.push(item);

          // Audio: Metal sound for coin, Paper sound for note!
          if (window.soundFX) {
            if (item.type === 'coin') {
              window.soundFX.playMetalCoin();
            } else {
              window.soundFX.playPaperRustle();
            }
          }

          this.createSparkles(item.x, item.y, 8, item.type === 'coin' ? '#FFD700' : '#48DBFB');
          break;
        }
      }
    };

    const handlePointerMove = (e) => {
      const pos = getPos(e);
      this.mouseVelocityX = pos.x - this.lastMouseX;
      this.mouseVelocityY = pos.y - this.lastMouseY;
      this.lastMouseX = pos.x;
      this.lastMouseY = pos.y;

      if (this.isDragging && this.draggedItem) {
        this.draggedItem.x = pos.x - this.dragOffsetX;
        this.draggedItem.y = pos.y - this.dragOffsetY;
        this.draggedItem.vx = this.mouseVelocityX * 0.45;
        this.draggedItem.vy = this.mouseVelocityY * 0.45;
      }
    };

    const handlePointerUp = () => {
      if (this.isDragging && this.draggedItem) {
        const item = this.draggedItem;
        item.vx = Math.min(Math.max(this.mouseVelocityX * 0.85, -20), 20);
        item.vy = Math.min(Math.max(this.mouseVelocityY * 0.85, -20), 20);
        item.vRot = (Math.random() - 0.5) * 0.18;

        if (Math.abs(item.vx) > 2 || Math.abs(item.vy) > 2) {
          if (window.soundFX) {
            if (item.type === 'coin') window.soundFX.playMetalCoin();
            else window.soundFX.playPaperRustle();
          }
          this.createSparkles(item.x, item.y, 10, item.type === 'coin' ? '#FFF' : '#2ECC71');
        }
      }
      this.isDragging = false;
      this.draggedItem = null;
    };

    this.canvas.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
  }

  createSparkles(x, y, count = 6, baseColor = '#FFD700') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 1.5,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? baseColor : '#FFFFFF',
        life: 1.0,
        decay: 0.025 + Math.random() * 0.03
      });
    }
  }

  // Draw Large Indian Rupee Coin (₹10 / ₹20 / ₹5)
  drawRupeeCoin(item) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);

    const r = item.radius;

    // Chunky 4px Black Pixel Drop Shadow
    ctx.fillStyle = '#0A0A0E';
    ctx.beginPath();
    ctx.arc(4, 4, r, 0, Math.PI * 2);
    ctx.fill();

    // Black Outer Border
    ctx.fillStyle = '#0A0A0E';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Outer Ring (Gold/Brass)
    ctx.fillStyle = item.outerColor;
    ctx.beginPath();
    ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
    ctx.fill();

    // Ridges / Notch dots on rim
    ctx.fillStyle = '#7D6608';
    const notches = 12;
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / notches) {
      const nx = Math.cos(a) * (r - 7);
      const ny = Math.sin(a) * (r - 7);
      ctx.fillRect(nx - 1.5, ny - 1.5, 3, 3);
    }

    // Inner Disc (Bimetallic Silver/Gold center)
    const innerRadius = item.bimetal ? r * 0.65 : r - 8;
    ctx.fillStyle = '#0A0A0E';
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = item.innerColor;
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Indian Rupee Symbol (₹) and Value
    ctx.fillStyle = '#0A0A0E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.floor(r * 0.55)}px 'Press Start 2P', monospace`;
    ctx.fillText('₹', 0, -r * 0.16);

    ctx.font = `bold ${Math.floor(r * 0.42)}px 'Press Start 2P', monospace`;
    ctx.fillText(item.denom.toString(), 0, r * 0.28);

    // Subtle glint shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Large Indian Rupee Note (₹500, ₹200, ₹100, ₹50, ₹2000)
  drawRupeeNote(item) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);

    const w = item.width;
    const h = item.height;
    const halfW = w / 2;
    const halfH = h / 2;

    // Black Drop Shadow
    ctx.fillStyle = '#0A0A0E';
    ctx.fillRect(-halfW + 5, -halfH + 5, w, h);

    // Thick Black Outline
    ctx.fillStyle = '#0A0A0E';
    ctx.fillRect(-halfW, -halfH, w, h);

    // Note Vibrant Body
    ctx.fillStyle = item.color;
    ctx.fillRect(-halfW + 3, -halfH + 3, w - 6, h - 6);

    // Inner Pattern Border
    ctx.strokeStyle = item.accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-halfW + 8, -halfH + 8, w - 16, h - 16);

    // Security Thread Strip (Vertical silver/green strip)
    ctx.fillStyle = '#F4D03F';
    ctx.fillRect(-halfW + w * 0.38, -halfH + 6, 4, h - 12);

    // Center Emblem Watermark Circle (Ashoka style circle)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(halfW - w * 0.24, 0, h * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0A0A0E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top Header: "RESERVE BANK OF INDIA" or "BHARAT"
    ctx.fillStyle = item.textColor;
    ctx.font = `bold ${Math.max(6, Math.floor(h * 0.09))}px 'Press Start 2P', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('RESERVE BANK OF INDIA', 0, -halfH + 16);

    // Prominent Rupee Symbol & Amount in Center
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0A0A0E';
    ctx.lineWidth = 3;
    const fontSize = Math.floor(h * 0.34);
    ctx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;
    const label = `₹${item.denom}`;
    ctx.strokeText(label, -halfW + w * 0.22, 4);
    ctx.fillText(label, -halfW + w * 0.22, 4);

    // Bottom-Left & Top-Right Numbers
    ctx.font = `bold 9px 'Press Start 2P', monospace`;
    ctx.fillStyle = '#0A0A0E';
    ctx.textAlign = 'left';
    ctx.fillText(`₹${item.denom}`, -halfW + 12, halfH - 12);
    ctx.textAlign = 'right';
    ctx.fillText(`₹${item.denom}`, halfW - 12, -halfH + 16);

    ctx.restore();
  }

  animate() {
    const heroSection = document.getElementById('hero-section');
    if (!heroSection || !heroSection.classList.contains('active')) {
      requestAnimationFrame(this.animate);
      return;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const gravity = 0.055;
    const friction = 0.985;
    const restitution = 0.72;

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      if (item !== this.draggedItem) {
        item.vy += gravity;
        item.vx *= friction;
        item.vy *= friction;

        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.vRot;

        if (Math.abs(item.vx) < 0.2 && Math.abs(item.vy) < 0.2) {
          item.vx += (Math.random() - 0.5) * 0.12;
          item.vy += (Math.random() - 0.5) * 0.12;
        }

        const bounds = item.type === 'coin' 
          ? { left: item.radius, right: this.canvas.width - item.radius, top: item.radius, bottom: this.canvas.height - item.radius }
          : { left: item.width / 2, right: this.canvas.width - item.width / 2, top: item.height / 2, bottom: this.canvas.height - item.height / 2 };

        if (item.x < bounds.left) {
          item.x = bounds.left;
          item.vx = -item.vx * restitution;
        } else if (item.x > bounds.right) {
          item.x = bounds.right;
          item.vx = -item.vx * restitution;
        }

        if (item.y < bounds.top) {
          item.y = bounds.top;
          item.vy = -item.vy * restitution;
        } else if (item.y > bounds.bottom) {
          item.y = bounds.bottom;
          item.vy = -item.vy * restitution;
        }
      }

      if (item.type === 'coin') {
        this.drawRupeeCoin(item);
      } else {
        this.drawRupeeNote(item);
      }
    }

    // Sparkles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(this.animate);
  }
}

window.MoneyPhysicsEngine = MoneyPhysicsEngine;
