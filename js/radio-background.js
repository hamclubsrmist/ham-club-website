(() => {
  'use strict';
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const canvas = document.getElementById('radioWaveCanvas');
  const ctx = canvas && canvas.getContext('2d', { alpha: true });
  if (!canvas || !ctx) return;

  // Theme preference is stored locally; no external service is used.
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem('ham-theme') || 'light'; } catch (_) {}
  function setTheme(theme) {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      const icon = toggle.querySelector('.theme-toggle-icon');
      const label = toggle.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = dark ? '☀' : '☾';
      if (label) label.textContent = dark ? 'Light' : 'Dark';
    }
    try { localStorage.setItem('ham-theme', dark ? 'dark' : 'light'); } catch (_) {}
  }
  setTheme(savedTheme);
  if (toggle) toggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let width = 0, height = 0, dpr = 1, raf = 0, last = 0;
  const particles = [];
  const particleCount = Math.min(76, Math.max(28, Math.floor((window.innerWidth * window.innerHeight) / 26000)));
  for (let i = 0; i < particleCount; i++) particles.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + .5, speed: Math.random() * .00011 + .000035, phase: Math.random() * Math.PI * 2 });
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function pointerMove(e) { pointer.tx = e.clientX / Math.max(1, width); pointer.ty = e.clientY / Math.max(1, height); }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', pointerMove, { passive: true });
  resize();

  function drawWave(time, baseY, amp, frequency, phase, color, lineWidth) {
    ctx.beginPath();
    for (let x = 0; x <= width + 8; x += 5) {
      const nx = x / Math.max(1, width);
      const influence = (pointer.x - .5) * 28;
      const y = baseY + Math.sin(nx * frequency + time * .0007 + phase) * amp
        + Math.sin(nx * frequency * .47 - time * .00043 + phase * 1.7) * amp * .38
        + Math.sin(nx * 4 + time * .0002 + phase) * 6 + influence;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
  }
  function frame(now) {
    if (reduceMotion && last) { drawStill(); return; }
    if (now - last < 28) { raf = requestAnimationFrame(frame); return; }
    last = now;
    pointer.x += (pointer.tx - pointer.x) * .045; pointer.y += (pointer.ty - pointer.y) * .045;
    const dark = root.dataset.theme === 'dark';
    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width * (.5 + (pointer.x - .5) * .22), height * (.53 + (pointer.y - .5) * .18), 0, width * .5, height * .52, Math.max(width, height) * .72);
    glow.addColorStop(0, dark ? 'rgba(13,74,116,.24)' : 'rgba(74,170,230,.12)');
    glow.addColorStop(1, dark ? 'rgba(4,10,20,.02)' : 'rgba(240,248,255,.02)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    const y = height * .56;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowBlur = dark ? 18 : 10;
    const a = dark ? .42 : .27;
    drawWave(now, y - height * .055, height * .075, 8.6, 0, `rgba(47,210,255,${a})`, 1.5);
    drawWave(now, y, height * .09, 7.1, 1.7, `rgba(101,104,255,${dark ? .34 : .2})`, 1.2);
    drawWave(now, y + height * .045, height * .065, 9.5, 3.4, `rgba(255,71,190,${dark ? .32 : .19})`, 1.35);
    drawWave(now, y + height * .095, height * .04, 11.2, 4.8, `rgba(46,190,255,${dark ? .22 : .14})`, 1);
    ctx.shadowBlur = 0;
    particles.forEach(p => {
      if (!reduceMotion) p.y -= p.speed * 16;
      if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
      const px = p.x * width + Math.sin(now * .0004 + p.phase) * 9 + (pointer.x - .5) * 18;
      const py = p.y * height + Math.cos(now * .0005 + p.phase) * 7 + (pointer.y - .5) * 12;
      ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dark ? `rgba(137,224,255,${.24 + (Math.sin(now * .001 + p.phase) + 1) * .19})` : `rgba(23,119,186,${.13 + (Math.sin(now * .001 + p.phase) + 1) * .13})`;
      ctx.fill();
    });
    ctx.restore();
    raf = requestAnimationFrame(frame);
  }
  function drawStill() {
    const dark = root.dataset.theme === 'dark';
    ctx.clearRect(0, 0, width, height);
    drawWave(0, height * .56, height * .07, 8, 0, dark ? 'rgba(47,210,255,.25)' : 'rgba(47,140,205,.16)', 1.5);
    drawWave(0, height * .62, height * .05, 10, 2, dark ? 'rgba(255,71,190,.2)' : 'rgba(255,71,190,.12)', 1.2);
  }
  raf = requestAnimationFrame(frame);
})();
