(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduceMotion;
  const root = document.documentElement;

  // mindig az oldal tetejéről induljon, hogy a nyitó animáció látszódjon
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* =========================================================
     Dátum: visszaszámláló + korfelirat
     ========================================================= */
  const TARGET = new Date(2026, 8, 20, 0, 0, 0); // a 25. születésnap
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const eyebrow = $('#eyebrow');
  const countdown = $('#countdown');
  const cdDone = $('#cd-done');
  const ageNote = $('#age-note');
  const cd = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };

  function tick() {
    const now = new Date();
    const diff = TARGET - now;

    if (diff > 0) {
      const days = Math.round((startOfDay(TARGET) - startOfDay(now)) / 864e5);
      cd.d.textContent = pad(Math.floor(diff / 864e5));
      cd.h.textContent = pad(Math.floor(diff / 36e5) % 24);
      cd.m.textContent = pad(Math.floor(diff / 6e4) % 60);
      cd.s.textContent = pad(Math.floor(diff / 1e3) % 60);
      eyebrow.textContent = days <= 1 ? 'Holnap lesz 25 éves' : `${days} nap múlva 25 éves`;
      ageNote.textContent = days <= 1 ? 'holnaptól!' : 'hamarosan!';
      return;
    }

    countdown.hidden = true;
    cdDone.hidden = false;
    const sameDay = startOfDay(now).getTime() === startOfDay(TARGET).getTime();
    cdDone.textContent = sameDay ? 'Ma van a nagy nap! 🎉' : 'Már 25 éves – és még mindig a legjobb 🐰';
    eyebrow.textContent = sameDay ? 'Ma van a nagy nap!' : '25 éves';
    ageNote.textContent = sameDay ? 'ma!' : 'meg is van!';
  }
  tick();
  setInterval(tick, 1000);

  /* =========================================================
     Konfetti
     ========================================================= */
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  const COLORS = ['#ff5c9d', '#ff2e4d', '#ffd25e', '#b9a4ff', '#fff4ee', '#6ee7c8'];
  const EMOJI = ['🐰', '🎂', '💖', '✨', '🚗'];
  let W = 0, H = 0, DPR = 1, parts = [], running = false;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.round(innerWidth * DPR);
    H = canvas.height = Math.round(innerHeight * DPR);
  }
  resize();
  addEventListener('resize', resize);

  function spawn({ x = innerWidth / 2, y = innerHeight / 2, n = 140, burst = false }) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const a = burst ? -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.3 : Math.PI / 2 + (Math.random() - .5) * .5;
      const sp = burst ? 9 + Math.random() * 13 : 2 + Math.random() * 4;
      const r = Math.random();
      parts.push({
        x: (burst ? x : Math.random() * innerWidth) * DPR,
        y: (burst ? y : -20 - Math.random() * innerHeight * .4) * DPR,
        vx: Math.cos(a) * sp * DPR,
        vy: Math.sin(a) * sp * DPR,
        g: (.16 + Math.random() * .1) * DPR,
        s: (5 + Math.random() * 7) * DPR,
        rot: Math.random() * 6.28,
        vr: (Math.random() - .5) * .35,
        c: COLORS[i % COLORS.length],
        kind: r < .12 ? 'emoji' : r < .55 ? 'rect' : 'circle',
        em: EMOJI[i % EMOJI.length]
      });
    }
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.y < H + 60 * DPR);
    for (const p of parts) {
      p.vy = Math.min(p.vy + p.g, 13 * DPR);
      p.vx *= .992;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === 'emoji') {
        ctx.font = `${p.s * 3}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.em, 0, 0);
      } else {
        ctx.fillStyle = p.c;
        if (p.kind === 'rect') ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66);
        else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.2, 0, 6.283); ctx.fill(); }
      }
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  /* =========================================================
     Gombok: meglepetés + torta
     ========================================================= */
  const WISHES = [
    'Boldog szülinapot, Kisnyuszi! 🐰',
    'Ma te vagy a főszereplő! ⭐',
    'A kis piros is gratulál! 🚗',
    'Még több fogalmazás, még több rajz! 🎨',
    '25 év, és még mindig a legjobb! 💖'
  ];
  let wishIdx = 0;
  const wishEl = $('#wish');

  $('#party').addEventListener('click', e => {
    wishEl.textContent = WISHES[wishIdx++ % WISHES.length];
    const r = e.currentTarget.getBoundingClientRect();
    spawn({ n: 130 });
    spawn({ x: r.left + r.width / 2, y: r.top, n: 70, burst: true });
  });

  const cakeWrap = $('#cakeWrap');
  const blowBtn = $('#blow');
  const cakeMsg = $('#cake-msg');
  blowBtn.addEventListener('click', () => {
    const blown = cakeWrap.classList.toggle('blown');
    blowBtn.textContent = blown ? '🔥 Gyújtsd újra!' : '🕯️ Fújd el a gyertyákat!';
    cakeMsg.textContent = blown ? 'Kívánj valamit, Kisnyuszi! 🌟' : '';
    if (blown) {
      const r = cakeWrap.getBoundingClientRect();
      spawn({ x: r.left + r.width / 2, y: r.top + r.height * .4, n: 160, burst: true });
      spawn({ n: 90 });
    }
  });

  /* =========================================================
     Ha nincs animáció: minden marad statikusan látható
     ========================================================= */
  const loader = $('#loader');
  if (!animate) {
    if (loader) loader.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- szöveg-darabolás ---------- */
  function split(el, mode) {
    const out = [];
    (function walk(node) {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.append(' '); return; }
            const w = document.createElement('span');
            if (mode === 'chars') {
              w.className = 'wd';
              [...tok].forEach(c => {
                const s = document.createElement('span');
                s.className = 'ch';
                s.textContent = c;
                w.append(s);
                out.push(s);
              });
            } else {
              w.className = 'w';
              w.textContent = tok;
              out.push(w);
            }
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return out;
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  function gradientColor(t) {
    const stops = [[255, 92, 157], [255, 46, 77], [255, 210, 94]];
    const seg = t < .5 ? 0 : 1;
    const k = t < .5 ? t * 2 : (t - .5) * 2;
    const [a, b] = [stops[seg], stops[seg + 1] || stops[seg]];
    return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
  }

  // Hero címsor
  const heroChars = [];
  $$('.title [data-split]').forEach(el => {
    const chars = split(el, 'chars');
    if (el.classList.contains('grad')) chars.forEach((c, i) => { c.style.color = gradientColor(i / Math.max(1, chars.length - 1)); });
    heroChars.push(...chars);
  });

  // Szekciócímek
  const headings = $$('.h2[data-split]').map(el => ({ el, chars: split(el, 'chars') }));

  // Szó-scrub szöveg
  const scrubWords = split($('#scrub'), 'words');

  /* ---------- betöltő ---------- */
  root.classList.add('locked');
  const count = $('#loader-count');
  const bar = $('#loader-bar');
  const prog = { v: 0 };

  gsap.set(heroChars, { yPercent: 118, rotate: 5 });
  gsap.set(['.eyebrow', '.lead', '.countdown', '.cd-done', '.hero-cta', '.nav'], { opacity: 0, y: 24 });
  gsap.set('.arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 40px 40px)' });
  gsap.set(['.badge', '.sticker'], { scale: 0 });

  function intro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(heroChars, { yPercent: 0, rotate: 0, duration: 1.15, stagger: .035 }, 0)
      .to('.arch', { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 40px 40px)', duration: 1.4, ease: 'power4.inOut' }, .1)
      .from('.arch img', { scale: 1.45, duration: 1.8 }, .1)
      .to(['.eyebrow', '.lead', '.countdown', '.cd-done', '.hero-cta', '.nav'], { opacity: 1, y: 0, duration: .9, stagger: .09 }, .35)
      .to('.badge', { scale: 1, duration: 1.1, ease: 'back.out(1.5)' }, .9)
      .to('.sticker', { scale: 1, duration: .8, stagger: .12, ease: 'back.out(2.2)' }, 1);
  }

  gsap.to(prog, {
    v: 25, duration: 1.5, ease: 'power2.inOut',
    onUpdate() {
      count.textContent = pad(Math.round(prog.v));
      bar.style.transform = `scaleX(${prog.v / 25})`;
    },
    onComplete() {
      gsap.to(loader, {
        yPercent: -100, duration: .9, ease: 'power4.inOut',
        onStart: () => gsap.delayedCall(.35, intro),
        onComplete: () => { loader.remove(); root.classList.remove('locked'); ScrollTrigger.refresh(); }
      });
    }
  });

  /* ---------- kurzor, mágnes, tilt ---------- */
  if (finePointer) {
    const cursor = $('#cursor');
    const qx = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' });
    const qy = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => {
      root.classList.add('has-cursor');
      qx(e.clientX); qy(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', e => {
      cursor.classList.toggle('big', !!e.target.closest('a, button, .tile, .scard'));
    });

    // spotlight a bento csempéken
    $$('.tile').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--mx', `${e.clientX - r.left}px`);
        t.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });

    // mágneses gombok
    $$('.magnetic').forEach(b => {
      const mx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' });
      const my = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .4);
      });
      b.addEventListener('pointerleave', () => { mx(0); my(0); });
    });

    // hero fotó 3D tilt
    const card = $('#photoCard');
    const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3' });
    $('.hero').addEventListener('pointermove', e => {
      ry((e.clientX / innerWidth - .5) * 14);
      rx(-(e.clientY / innerHeight - .5) * 12);
    });
    $('.hero').addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  /* ---------- scroll-animációk ---------- */

  // hero: parallax a nagy 25-ösre és a fotóra
  gsap.to('.hero-25', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-visual', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // szekciócímek
  headings.forEach(({ el, chars }) => {
    gsap.set(chars, { yPercent: 118, rotate: 4 });
    gsap.to(chars, {
      yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: .02,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });
  $$('.kicker').forEach(k => {
    gsap.from(k, { opacity: 0, x: -24, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: k, start: 'top 90%', once: true } });
  });

  // bento
  gsap.from('.tile', {
    y: 90, opacity: 0, rotate: 2.5, scale: .94, duration: 1, ease: 'power4.out', stagger: .12,
    scrollTrigger: { trigger: '.bento', start: 'top 82%', once: true }
  });
  const ageNum = $('#age-num');
  const ageObj = { v: 0 };
  ageNum.textContent = '00';
  ScrollTrigger.create({
    trigger: '.t-age', start: 'top 85%', once: true,
    onEnter: () => gsap.to(ageObj, { v: 25, duration: 1.6, ease: 'power3.out', onUpdate: () => { ageNum.textContent = Math.round(ageObj.v); } })
  });

  // segítség: szavak felgyulladnak, nyuszi kirajzolódik
  gsap.fromTo(scrubWords, { opacity: .14 }, {
    opacity: 1, ease: 'none', stagger: .12,
    scrollTrigger: { trigger: '#scrub', start: 'top 78%', end: 'bottom 42%', scrub: true }
  });
  const strokes = $$('.doodle path[pathLength], .doodle ellipse[pathLength]');
  gsap.set('.doodle .eye, .doodle .nose', { opacity: 0 });
  gsap.set('.pencil', { opacity: 0 });
  const doodleTl = gsap.timeline({ scrollTrigger: { trigger: '.help-art', start: 'top 85%', end: 'bottom 45%', scrub: .6 } });
  doodleTl
    .fromTo(strokes, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', stagger: .12, duration: .6 })
    .to('.doodle .eye, .doodle .nose', { opacity: 1, duration: .2, stagger: .05 }, '>-.1')
    .to('.pencil', { opacity: 1, duration: .2 }, '<');
  gsap.from('.chip', { y: 30, opacity: 0, stagger: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.chips', start: 'top 90%', once: true } });

  // konyha: papír + terminál
  gsap.from('.receipt', { y: 100, rotate: 6, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.kitchen', start: 'top 80%', once: true } });
  gsap.from('.r-list li', { x: -30, opacity: 0, stagger: .15, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: '.receipt', start: 'top 70%', once: true } });
  gsap.set('.stamp', { scale: 3, opacity: 0, rotate: -30 });
  gsap.to('.stamp', {
    scale: 1, opacity: .9, rotate: -14, duration: .35, ease: 'power4.in',
    scrollTrigger: { trigger: '.receipt', start: 'top 45%', once: true },
    onComplete: () => gsap.fromTo('.receipt', { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' })
  });

  const termLines = $$('#terminal .tl');
  gsap.set(termLines, { opacity: 0, x: -12 });
  gsap.to(termLines, {
    opacity: 1, x: 0, duration: .01, stagger: .55, ease: 'none',
    scrollTrigger: { trigger: '#terminal', start: 'top 75%', once: true }
  });
  gsap.from('#terminal', { y: 80, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '#terminal', start: 'top 88%', once: true } });

  // kis piros: pinelt jelenet, az autó végigmegy az úton
  const car = $('.alto-car');
  const altoTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.alto-stage', start: 'top top', end: '+=150%', pin: true, scrub: .7, invalidateOnRefresh: true }
  });
  altoTl
    .fromTo('.alto-bgtext', { xPercent: 12 }, { xPercent: -42, duration: 1 }, 0)
    .fromTo('.alto-photo', { rotate: -9, scale: .72, yPercent: 14 }, { rotate: 0, scale: 1, yPercent: 0, duration: .55 }, 0)
    .fromTo('.alto-copy > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: .06, duration: .2 }, 0)
    .fromTo(car, { x: () => -car.getBoundingClientRect().width - 30 }, { x: () => innerWidth + 30, duration: 1 }, 0);

  // képkártyák: lekicsinyednek, ahogy a következő ráúszik
  const cards = $$('.scard');
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(c, {
      scale: .9, opacity: .55, ease: 'none',
      scrollTrigger: { trigger: next, start: 'top 75%', end: 'top 12%', scrub: true }
    });
  });

  // finálé
  gsap.from('.cake', { y: 120, rotate: -8, opacity: 0, duration: 1.2, ease: 'back.out(1.3)', scrollTrigger: { trigger: '.cake-wrap', start: 'top 85%', once: true } });
  gsap.from('.fin-title, .fin-text, .sign', { y: 60, opacity: 0, stagger: .15, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: '.fin-title', start: 'top 88%', once: true } });

  // betűtípusok / képek betöltése után újraszámolás
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  addEventListener('load', refresh);
})();
