document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Barra de progrés */
  const bar = $('#progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Índex lateral */
  const links = $$('.side-in a');
  const io = new IntersectionObserver(es => es.forEach(e => {
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
    data: { datasets: [{ data: [[0, 2317], [45, 2143], [90, 1993], [135, 1824], [180, 1633]].map(([x, y]) => ({ x, y })), showLine: true, borderColor: '#0d0d0d', backgroundColor: '#0d0d0d', pointRadius: 4 }] },
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
