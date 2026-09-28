document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Barra de progrés de lectura */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Índex lateral: resalta la secció activa */
  const links = $$('.side-in a');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  $$('section[id]').forEach(s => io.observe(s));

  /* Mòdul CAD amb transició suau */
  const cad = [
    { img: 'cad-1-inmoov.jpg', t: 'Antebraç InMoov', d: "Base escollida per la seva estructura sòlida, els allotjaments per als servos i la rotació del canell. La mà original és difícil de muntar i es desajusta amb l'ús." },
    { img: 'cad-2-brainyhand.jpg', t: 'Mà BrainyHand', d: "Alternativa amb menys peces i frontisses flexibles. No té rotació de canell i no encaixa directament amb l'antebraç d'InMoov." },
    { img: 'cad-3-fusion.jpg', t: 'Redisseny a Fusion 360', d: "Nova peça base per a la mà, amb les distàncies i forats del canell d'InMoov. Uneix els dos dissenys i conserva la rotació." },
    { img: 'cad-4-final.jpg', t: 'Braç ensamblat', d: 'Impressió 3D i muntatge del conjunt, amb els servos a la part posterior i els dits accionats amb fil de niló.' }
  ];
  const panel = $('#cad-panel'), cimg = $('#cad-img'), ct = $('#cad-title'), cd = $('#cad-desc');
  const tabs = $$('.tab');
  function showCad(i, animate = true) {
    tabs.forEach((b, k) => { b.classList.toggle('active', k === i); b.setAttribute('aria-selected', k === i); });
    const apply = () => {
      cimg.src = cad[i].img; cimg.alt = 'Versió CAD: ' + cad[i].t;
      ct.textContent = cad[i].t; cd.textContent = cad[i].d;
      panel.classList.remove('fade');
    };
    if (!animate) return apply();
    panel.classList.add('fade');
    setTimeout(apply, 250);
  }
  tabs.forEach((b, i) => b.addEventListener('click', () => showCad(i)));
  showCad(0, false);

  /* Diagrama d'arquitectura interactiu */
  const nodes = [
    ['Sensors flex', 'Cinc Spectra Symbol llegits amb divisors de tensió de 47 kΩ. Cada lectura és la mitjana de 8 mostres.'],
    ['MPU6050', 'Mesura el gir del canell per I2C. Giroscopi i acceleròmetre es fusionen amb un filtre complementari (α = 0,98) i unwrapping.'],
    ['ESP32 (guant)', 'Wemos D1 R32 que valida el rang (1000–3000) i envia una trama de text cada 100 ms com a client Bluetooth.'],
    ['Bluetooth SPP', 'Enllaç sèrie clàssic entre les dues ESP32, a 10 Hz. La trama porta cinc valors flex i l\'angle del canell.'],
    ['ESP32 (braç)', 'Servidor Bluetooth. Interpreta la trama, converteix cada lectura en angle amb map() i suavitza el moviment.'],
    ['Servos', 'Sis DM996: cinc tiren dels dits amb fil de niló i un gira el canell amb engranatges. Alimentats a 6,5 V.']
  ];
  const info = $('#node-info'), nbtn = $$('.node');
  function showNode(n) {
    nbtn.forEach((b, k) => b.classList.toggle('active', k === n));
    info.innerHTML = '';
    const h = document.createElement('h3'); h.textContent = nodes[n][0];
    const p = document.createElement('p'); p.textContent = nodes[n][1];
    info.append(h, p);
  }
  nbtn.forEach((b, n) => b.addEventListener('click', () => showNode(n)));
  showNode(0);

  /* Copiar codi */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.closest('.code').querySelector('pre:not([hidden]) code').innerText);
      b.textContent = 'Copiat';
    } catch { b.textContent = "No s'ha pogut copiar"; }
    setTimeout(() => b.textContent = 'Copia el codi', 1800);
  }));

  /* Pestanyes de codi */
  $$('.ctab').forEach(b => b.addEventListener('click', () => {
    $$('.ctab').forEach(x => x.classList.toggle('active', x === b));
    $$('.fw pre').forEach(p => p.hidden = p.id !== b.dataset.t);
  }));

  /* Filtre de la llista de materials */
  $('#bomSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    $$('#bom tbody tr').forEach(r => r.hidden = !r.innerText.toLowerCase().includes(q));
  });

  /* Mode resum / tècnic i PDF */
  const mode = $('#mode');
  mode.addEventListener('click', () => {
    const s = document.body.classList.toggle('summary');
    mode.textContent = s ? 'Mode tècnic' : 'Mode resum';
    links.forEach(l => { const t = $(l.getAttribute('href')); l.hidden = !!t && getComputedStyle(t).display === 'none'; });
  });
  $('#print').addEventListener('click', () => print());

  /* Trama que recorre el diagrama */
  const frame = ['Exemple de lectura ADC: 2010 1962 2231 2083 1990', 'Angle del canell (roll) amb filtre complementari', 'Trama de text: "2010 1962 2231 2083 1990 45"', 'En vol per Bluetooth SPP, una cada 100 ms', 'map() converteix cada lectura en angle', 'PWM als sis servos'];
  $('#send').addEventListener('click', () => nodes.forEach((_, n) => setTimeout(() => {
    showNode(n);
    const p = document.createElement('p'); p.className = 'mono'; p.textContent = frame[n]; info.append(p);
  }, n * 1100)));

  /* Demo del salt de ±180° */
  const dial = $('#dial');
  const clamp = v => Math.min(180, Math.max(0, v));
  function drawDial() {
    const g = +dial.value, a = ((g + 180) % 360) - 180, d = a - g;
    const au = d > 180 ? a - 360 : d < -180 ? a + 360 : a;
    const no = clamp(0.5 * g + 0.5 * a), ok = clamp(0.5 * g + 0.5 * au);
    $('#b-no').style.width = no / 1.8 + '%'; $('#v-no').textContent = Math.round(no);
    $('#b-ok').style.width = ok / 1.8 + '%'; $('#v-ok').textContent = Math.round(ok);
  }
  dial.addEventListener('input', drawDial); drawDial();

  /* Demo d'alimentació */
  const sep = $('#sep'); let rst = 0;
  setInterval(() => {
    const v = sep.checked ? 5 : 5 - Math.random() * 2.4;
    rst = !sep.checked && v < 3.3 ? 6 : Math.max(0, rst - 1);
    $('#b-v').style.width = v / 5 * 100 + '%';
    $('#v-st').textContent = rst ? 'Wemos reiniciada' : 'Wemos estable: ' + v.toFixed(1) + ' V';
  }, 250);

  /* Mà fantasma */
  const hand = $('#hand'), rows = ['Polze', 'Índex', 'Cor', 'Anular', 'Menyic'].map(n => {
    const r = document.createElement('div');
    r.innerHTML = `<span class="mono">${n}</span><input type="range" min="0" max="100" value="0" aria-label="${n}"><div class="bar"><i></i></div>`;
    hand.append(r);
    return { inp: $('input', r), bar: $('i', r), ang: 0 };
  });
  setInterval(() => rows.forEach(f => { f.ang += (f.inp.value - f.ang) / 4; f.bar.style.width = f.ang + '%'; }), 100);

  /* Comparadors abans / després */
  $$('.cmp').forEach(c => {
    const top = $('.cmp-top', c);
    top.style.clipPath = 'inset(0 50% 0 0)';
    $('input', c).addEventListener('input', e => {
      c.style.setProperty('--p', e.target.value + '%');
      top.style.clipPath = `inset(0 ${100 - e.target.value}% 0 0)`;
    });
  });

  /* Visor amb zoom i arrossegament */
  const lb = $('#lightbox'), lbi = $('#lb-img');
  let s = 1, x = 0, y = 0, drag = false, sx = 0, sy = 0;
  const draw = () => lbi.style.transform = `translate(${x}px,${y}px) scale(${s})`;
  const open = img => { lbi.src = img.src; lbi.alt = img.alt; s = 1; x = y = 0; draw(); lb.hidden = false; };
  const close = () => lb.hidden = true;
  $$('img.zoom').forEach(i => i.addEventListener('click', () => open(i)));
  $('#lb-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  lb.addEventListener('wheel', e => {
    e.preventDefault();
    s = Math.min(4, Math.max(1, s + (e.deltaY < 0 ? .2 : -.2)));
    if (s === 1) x = y = 0;
    draw();
  }, { passive: false });
  lbi.addEventListener('pointerdown', e => { drag = true; sx = e.clientX - x; sy = e.clientY - y; lbi.setPointerCapture(e.pointerId); });
  lbi.addEventListener('pointermove', e => { if (!drag) return; x = e.clientX - sx; y = e.clientY - sy; draw(); });
  lbi.addEventListener('pointerup', () => drag = false);
});
