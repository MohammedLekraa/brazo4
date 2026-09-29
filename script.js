document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  if (window.Chart) { Chart.defaults.font.family = "'Martian Mono',monospace"; Chart.defaults.font.size = 11; Chart.defaults.color = '#6f6a5e'; Chart.defaults.borderColor = '#e4ddcd'; }

  /* Barra de progrés */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Índex lateral */
  const toc = document.createElement('nav'); toc.className = 'tocbar'; toc.innerHTML = $('.side-in').innerHTML; $('.nav').insertBefore(toc, $('.nav .btn'));
  const links = $$('.side-in a, .tocbar a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) document.dispatchEvent(new CustomEvent('sec', { detail: e.target.id }));
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-30% 0px -60% 0px' });
  $$('section[id]').forEach(s => io.observe(s));

  /* Disseny del braç: pestanyes amb transició */
  const cad = [
    { img: 'img/inmoov.jpg', t: 'Antebraç InMoov', d: "Base escollida per la seva estructura sòlida: allotjaments per als servos, passos interns per als fils i una articulació que permet girar el canell. La mà original és complexa de muntar i es desajusta amb l'ús." },
    { img: 'img/brainyhand.jpg', t: 'Mà BrainyHand', d: "Alternativa més simple, amb menys peces i frontisses flexibles. No té rotació de canell i no encaixa directament amb l'antebraç d'InMoov." },
    { img: 'img/fusion.jpg', t: 'Redisseny a Fusion 360', d: "Vaig modelar una peça base nova per a la mà, amb les distàncies i els forats del canell d'InMoov. A l'esquerra, el disseny original; a la dreta, el modificat amb l'ancoratge." },
    { img: 'img/brazo.jpg', t: 'Braç ensamblat', d: "Resultat final: mà i antebraç units, amb els sis servos a la part posterior de l'antebraç i els dits accionats amb fil de niló." }
  ];
  const panel = $('#cad-panel'), tabs = $$('.tab');
  function showCad(i, anim = true) {
    tabs.forEach((b, k) => { b.classList.toggle('active', k === i); b.setAttribute('aria-selected', k === i); });
    const apply = () => {
      $('#cad-img').src = cad[i].img; $('#cad-img').alt = cad[i].t;
      $('#cad-title').textContent = cad[i].t; $('#cad-desc').textContent = cad[i].d;
      panel.classList.remove('fade');
    };
    if (!anim) return apply();
    panel.classList.add('fade'); setTimeout(apply, 250);
  }
  tabs.forEach((b, i) => b.addEventListener('click', () => showCad(i)));
  showCad(0, false);

  /* Guant amb fletxes. Coordenades en % de la imatge: label (lx,ly), destí (tx,ty). side: t = etiqueta a dalt, b = a baix */
  const marks = [
    { txt: 'Sensors de flexió', lx: 80, ly: 5, tx: 86, ty: 38, side: 't' },
    { txt: 'IMU MPU6050', lx: 62, ly: 86, tx: 62, ty: 50, side: 'b' },
    { txt: "Caixa d'electrònica", lx: 20, ly: 86, tx: 20, ty: 70, side: 'b' }
  ];
  const g = $('#glove'), W = 923, H = 501;
  let svg = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs><marker id="ah" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 z" fill="#0d0d0d"/></marker></defs>`;
  marks.forEach(m => {
    const y1 = m.side === 't' ? m.ly + 9 : m.ly;
    svg += `<line x1="${m.lx * W / 100}" y1="${y1 * H / 100}" x2="${m.tx * W / 100}" y2="${m.ty * H / 100}" stroke="#0d0d0d" stroke-width="2" marker-end="url(#ah)"/>`;
    g.insertAdjacentHTML('beforeend', `<span class="tag" style="left:${m.lx}%;top:${m.ly}%">${m.txt}</span>`);
  });
  g.insertAdjacentHTML('beforeend', svg + '</svg>');

  /* Gràfica ADC vs angle (Taula 4 de la memòria) */
  if (window.Chart) new Chart($('#chart'), {
    type: 'scatter',
    data: { datasets: [{ data: [[0, 2317], [45, 2143], [90, 1993], [135, 1824], [180, 1633]].map(([x, y]) => ({ x, y })), showLine: true, borderColor: '#2437ff', backgroundColor: '#2437ff', pointRadius: 4 }] },
    options: { plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Angle del dit (°)' } }, y: { title: { display: true, text: 'Lectura ADC' } } } }
  });

  /* Calculadora map() */
  const adc = $('#adc');
  const calc = () => {
    const x = +adc.value;
    $('#adc-v').textContent = x;
    $('#adc-a').textContent = Math.trunc((x - 1530) * (0 - 180) / (2100 - 1530)) + 180;
  };
  adc.addEventListener('input', calc); calc();

  /* Marquesina de la trama (simulació) */
  const rnd = (a, b) => Math.round(a + Math.random() * (b - a));
  const fr = () => `<span>${rnd(1530, 2100)} ${rnd(1530, 2100)} ${rnd(1700, 2300)} ${rnd(1650, 2100)} ${rnd(1730, 2000)} ${rnd(0, 180)}</span>`;
  const tk = Array.from({ length: 8 }, fr).join('');
  $('#tick').innerHTML = tk + tk;

  /* Aparició suau */
  const rv = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } }), { threshold: .06 });
  $$('section > *').forEach(el => { el.classList.add('rv'); rv.observe(el); });

  /* Gràfics dels sensors */
  if (window.Chart) {
    const ink = '#14110d', acc = '#2437ff', teal = '#ff5a1f', sand = '#cfc8b8';
    const D = { r: [36066, 42811, 49570, 58518, 70860], v: [1.87, 1.73, 1.61, 1.47, 1.32] }, L = { r: 'Rflex (Ω)', v: 'Vout (V)' };
    const multi = new Chart($('#c-multi'), { type: 'line', data: { labels: [0, 45, 90, 135, 180], datasets: [{ data: D.r, borderColor: acc, backgroundColor: acc, tension: .25, pointRadius: 5 }] },
      options: { plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'Angle del dit (°)' } }, y: { title: { display: true, text: L.r } } } } });
    $$('#ctabs .tab').forEach(b => b.addEventListener('click', () => {
      $$('#ctabs .tab').forEach(x => x.classList.toggle('active', x === b));
      multi.data.datasets[0].data = D[b.dataset.k]; multi.options.scales.y.title.text = L[b.dataset.k]; multi.update();
    }));
    new Chart($('#c-rf'), { type: 'bar', data: { labels: ['10 kΩ', '47 kΩ'], datasets: [{ data: [310, 700], backgroundColor: [sand, acc] }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: 'Variació de la lectura ADC' } } } } });
    new Chart($('#c-cal'), { type: 'bar', data: { labels: ['Polze', 'Índex', 'Cor', 'Anular', 'Menyic'], datasets: [{ data: [[1530, 2100], [1530, 2100], [1700, 2300], [1650, 2100], [1730, 2000]], backgroundColor: ink, borderSkipped: false }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 1400, max: 2400, title: { display: true, text: 'Lectura ADC' } } } } });

    /* Simulador del filtre complementari */
    const N = 300, dt = .1; let seed = 7;
    const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647 - .5;
    const th = Array.from({ length: N }, (_, k) => 60 * Math.sin(2 * Math.PI * k * dt / 20));
    const ac = th.map(v => v + rand() * 20);
    const gyro = th.map((v, k) => v + .06 * k);
    const fuse = a => { let f = 0; return th.map((v, k) => f = a * (f + (k ? v - th[k - 1] : 0) + .06) + (1 - a) * ac[k]); };
    const ds = (label, data, c, w, extra = {}) => ({ label, data, borderColor: c, borderWidth: w, pointRadius: 0, ...extra });
    const sim = new Chart($('#c-sim'), { type: 'line', data: { labels: th.map((_, k) => Math.round(k * dt)), datasets: [
      ds('Angle real', th, ink, 1.5, { borderDash: [4, 4] }), ds('Només giroscopi', gyro, acc, 1.5), ds('Només acceleròmetre', ac, sand, 1), ds('Filtre complementari', fuse(.98), teal, 2.5)] },
      options: { animation: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { ticks: { maxTicksLimit: 8 }, title: { display: true, text: 'Temps (s)' } }, y: { title: { display: true, text: 'Angle (°)' } } } } });
    const al = $('#al');
    al.addEventListener('input', () => { $('#al-v').textContent = (+al.value).toFixed(2); sim.data.datasets[3].data = fuse(+al.value); sim.update('none'); });
    $('#al-v').textContent = '0.98';
  }

  /* Materials: cerca, categories i preus editables */
  const parts = [
    ['Wemos D1 R32 (ESP32)', 'Electrònica', 2, 10.5], ['MPU6050 (GY-521)', 'Electrònica', 1, 3.5],
    ['Flex sensor FS-L-0055-253-ST', 'Electrònica', 5, 14], ['Resistència 47 kΩ', 'Electrònica', 5, .05],
    ['Condensador de desacoblament', 'Electrònica', 1, .3], ['Placa de coure per a PCB', 'Electrònica', 2, 3],
    ['Servo digital DM996 15 kg·cm', 'Actuació', 6, 9], ['Fil de niló per als tendons', 'Actuació', 1, 4],
    ['Bateria Li-ion 18650', 'Alimentació', 2, 5], ['Portabateries 2 × 18650', 'Alimentació', 1, 1.5],
    ['Bateria Li-ion 5500 mAh (guant)', 'Alimentació', 1, 15], ['Font de laboratori Promax FAC-363B', 'Alimentació', 1, 0],
    ['Filament PLA (1 kg)', 'Fabricació', 1, 20], ['Filament TPU (1 kg)', 'Fabricació', 1, 25], ['Guant', 'Fabricació', 1, 5]
  ];
  let prices = null; try { prices = JSON.parse(localStorage.getItem('prices')); } catch {}
  if (!Array.isArray(prices) || prices.length !== parts.length) prices = parts.map(p => p[3]);
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const eur = v => v.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });
  let cat = 'Totes';
  $('#chips').innerHTML = ['Totes', ...new Set(parts.map(p => p[1]))].map(c => `<button class="chip${c === cat ? ' on' : ''}">${c}</button>`).join('');
  const tb = $('#mt tbody');
  tb.innerHTML = parts.map((p, i) => `<tr data-i="${i}"><td>${p[0]}</td><td><span class="pill">${p[1]}</span></td><td>${p[2]}</td><td><input type="number" min="0" step="0.01" value="${prices[i]}" aria-label="Preu de ${p[0]}"></td><td class="sub"></td></tr>`).join('') + '<tr id="none" hidden><td colspan="5">Cap component coincideix amb la cerca.</td></tr>';
  const rows = $$('tr[data-i]', tb);
  function upd() {
    const q = norm($('#q').value); let tot = 0, n = 0, all = 0;
    rows.forEach(r => {
      const i = +r.dataset.i, p = parts[i], sub = p[2] * (+prices[i] || 0); all += sub;
      $('.sub', r).textContent = eur(sub);
      const show = (cat === 'Totes' || p[1] === cat) && norm(p[0] + ' ' + p[1]).includes(q);
      r.hidden = !show; if (show) { tot += sub; n++; }
    });
    $('#none').hidden = n > 0; $('#tot').textContent = eur(tot); $('#grand').textContent = eur(all);
  }
  $('#q').addEventListener('input', upd);
  $('#chips').addEventListener('click', e => { if (!e.target.matches('.chip')) return; cat = e.target.textContent; $$('.chip').forEach(c => c.classList.toggle('on', c === e.target)); upd(); });
  tb.addEventListener('input', e => {
    const r = e.target.closest('tr[data-i]'); if (!r) return;
    prices[+r.dataset.i] = e.target.value; try { localStorage.setItem('prices', JSON.stringify(prices)); } catch {} upd();
  });
  addEventListener('keydown', e => { if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#q').focus(); } });
  upd();

  /* Guant i braç en directe: la pàgina és el sensor */
  const G = { objectius: ['paper', [0, 0, 0, 0, 0]], sistema: ['blue', [1, 0, 1, 1, 1]], disseny: ['yellow', [1, 1, 1, 1, 1]], guant: ['paper', [0, 0, 0, 0, 0]], flex: ['coral', [.6, .6, 0, 0, 0]], imu: ['blue', [0, 0, 0, 0, 0]], pcb: ['paper', [1, 0, 0, 1, 1]], bluetooth: ['yellow', [1, 0, 1, 1, 0]], material: ['coral', [0, 1, 1, 1, 1]] };
  const RNG = [[1530, 2100], [1530, 2100], [1700, 2300], [1650, 2100], [1730, 2000]], LEN = [40, 46, 52, 48, 38], FX = [0, 34, 47, 60, 73];
  const cl = v => Math.min(1, Math.max(0, v));
  const flex = [0, 0, 0, 0, 0], arm = [0, 0, 0, 0, 0]; let roll = 0, armRoll = 0, demo = false;
  document.body.dataset.t = 'paper';
  document.addEventListener('sec', e => { const s = G[e.detail]; if (!s) return; document.body.dataset.t = s[0]; if (!demo) s[1].forEach((v, i) => flex[i] = v); });
  const build = svg => {
    svg.innerHTML = '<g class="hh"><rect class="palm" x="30" y="68" width="60" height="58" rx="14"/>' + [0, 1, 2, 3, 4].map(i => i
      ? `<rect class="fg" data-i="${i}" x="${FX[i] - 5.5}" width="11" rx="5.5"/>`
      : '<g transform="translate(34,112) rotate(-42)"><rect class="fg" data-i="0" x="-6" width="12" rx="6"/></g>').join('') + '</g><rect class="ar" x="42" y="130" width="36" height="35" rx="4"/>';
    return { fs: $$('.fg', svg), hh: $('.hh', svg) };
  };
  const hg = build($('#h-g')), ha = build($('#h-a'));
  const paint = (h, f, r) => {
    h.fs.forEach((el, i) => { const hgt = LEN[i] * (1 - .55 * f[i]); el.setAttribute('height', hgt); el.setAttribute('y', i ? 72 - hgt : -hgt); });
    h.hh.setAttribute('transform', `rotate(${r * .4} 60 128)`);
  };
  (function loop(t) {
    if (demo) { t /= 1000; flex.forEach((_, i) => flex[i] = .5 + .5 * Math.sin(t * 2.2 + i * .8)); roll = 90 + 80 * Math.sin(t * .9); }
    paint(hg, flex, roll); paint(ha, arm, armRoll); requestAnimationFrame(loop);
  })(0);
  const scr = () => { if (!demo) roll = cl(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 180; };
  addEventListener('scroll', scr, { passive: true }); scr();
  const pkt = $('#pkt');
  setInterval(() => {
    const adc = flex.map((f, i) => Math.round(RNG[i][1] - f * (RNG[i][1] - RNG[i][0]))), rs = Math.round(roll);
    $('#hud-t').textContent = adc.join(' ') + ' ' + rs;
    adc.forEach((a, i) => arm[i] += ((RNG[i][1] - a) / (RNG[i][1] - RNG[i][0]) - arm[i]) / 4);
    armRoll += (rs - armRoll) / 4;
    $('#hud-r').textContent = `canell ${rs}° · servo ${Math.round(armRoll)}°`;
    pkt.classList.remove('go'); void pkt.offsetWidth; pkt.classList.add('go');
  }, 100);
  let pd = null; const hgs = $('#h-g');
  hgs.addEventListener('pointerdown', e => { const f = e.target.closest('.fg'); if (!f) return; pd = { i: +f.dataset.i, y: e.clientY, v: flex[+f.dataset.i] }; hgs.setPointerCapture(e.pointerId); });
  hgs.addEventListener('pointermove', e => { if (pd) flex[pd.i] = cl(pd.v + (e.clientY - pd.y) / 60); });
  hgs.addEventListener('pointerup', () => pd = null);
  $('#demo').addEventListener('click', e => { demo = !demo; e.target.textContent = demo ? '■ Atura' : '▶ Mou el guant'; if (!demo) scr(); });

  /* Comptadors */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const b = e.target, m = b.textContent.match(/^(\d+)(.*)$/); if (!m) return;
    const n = +m[1], t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 900); b.textContent = Math.round(n * k) + m[2]; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 1 });
  $$('.stats b').forEach(b => cio.observe(b));

  /* Visor amb zoom i arrossegament */
  const lb = $('#lb'), li = $('#lb-img');
  let s = 1, x = 0, y = 0, drag = false, sx = 0, sy = 0;
  const draw = () => li.style.transform = `translate(${x}px,${y}px) scale(${s})`;
  const close = () => lb.hidden = true;
  $$('img.zoom').forEach(i => i.addEventListener('click', () => { li.src = i.src; li.alt = i.alt; s = 1; x = y = 0; draw(); lb.hidden = false; }));
  $('#lb-x').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  lb.addEventListener('wheel', e => {
    e.preventDefault();
    s = Math.min(4, Math.max(1, s + (e.deltaY < 0 ? .2 : -.2)));
    if (s === 1) x = y = 0;
    draw();
  }, { passive: false });
  li.addEventListener('pointerdown', e => { drag = true; sx = e.clientX - x; sy = e.clientY - y; li.setPointerCapture(e.pointerId); });
  li.addEventListener('pointermove', e => { if (drag) { x = e.clientX - sx; y = e.clientY - sy; draw(); } });
  li.addEventListener('pointerup', () => drag = false);
});
