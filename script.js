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
    { img: 'Brazo3.jpg', t: 'Modelat CAD v1.0', d: "Primera versió estructural, impresa en PLA. Es van detectar punts de fatiga a l'eix principal de rotació." },
    { img: 'Brazo2.jpg', t: 'Reforç de la base v2.0', d: 'Base articulada redissenyada: parets més gruixudes i coixinets de bola per reduir la fricció.' },
    { img: 'Brazo4.jpg', t: 'Integració de servos v3.0', d: 'Acoblaments mecànics ajustats als servomotors i guiat de cables intern optimitzat.' }
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
    ['Sensors flex', 'Cinc sensors Spectra Symbol mesuren la curvatura de cada dit. El divisor de tensió els converteix en un senyal llegible per l\'ADC.'],
    ['MPU6050', 'La IMU mesura acceleració i velocitat angular del canell per I2C. La fusió de sensors en calcula pitch i roll.'],
    ['ESP32 (guant)', 'Llegeix flex i IMU, filtra el senyal amb una mitjana mòbil i empaqueta les dades a 50 Hz.'],
    ['Bluetooth', 'Envia una trama compacta amb cinc valors de flexió, pitch, roll i marca de temps entre els dos ESP32.'],
    ['ESP32 + PCA9685', 'El receptor decodifica la trama i genera els PWM dels sis canals amb el controlador PCA9685.'],
    ['Servos', 'Sis MG996R alimentats a part (5 V, 5 A) mouen les articulacions i reprodueixen la posició de la mà.']
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

  /* Copiar bloc de codi */
  const copy = $('#copy');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('.code code').innerText);
      copy.textContent = 'Copiat';
    } catch { copy.textContent = 'No s\'ha pogut copiar'; }
    setTimeout(() => copy.textContent = 'Copia el codi', 1800);
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
