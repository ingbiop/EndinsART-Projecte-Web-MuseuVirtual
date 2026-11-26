// Comportament de la pàgina d'inici — EndinsART

const IMAGE_PROXY       = 'api/artic-image.php';
const N_COLUMNES        = 7;
const MIN_PER_COLUMNA   = 8;
const MUSIC_RESUME_KEY  = 'endinsartIntroMusicTime';
const MUSIC_TIME_PARAM  = 'musicTime';

// image_ids verificats via API (domini públic, imatge disponible)
const FALLBACK_ARTWORKS = [
  { title: 'A Sunday on La Grande Jatte — 1884', artist_title: 'Georges Seurat',       image_id: '2d484387-2509-5e8e-2c43-22f9981972eb' },
  { title: 'The Bedroom',                        artist_title: 'Vincent van Gogh',      image_id: '6644829f-f292-c5c4-a73c-0356a6fdbf0d' },
  { title: 'Water Lilies',                        artist_title: 'Claude Monet',          image_id: '3c27b499-af56-f0d5-93b5-a7f2f1ad5813' },
  { title: 'Paris Street; Rainy Day',             artist_title: 'Gustave Caillebotte',   image_id: 'f8fd76e9-c396-5678-36ed-6a348c904d27' },
  { title: 'Self-Portrait',                       artist_title: 'Vincent van Gogh',      image_id: '47c5bcb8-62ef-e5d7-55e7-f5121f409a30' },
  { title: 'The Bay of Marseille',                artist_title: 'Paul Cézanne',          image_id: 'd4ca6321-8656-3d3f-a362-2ee297b2b813' },
  { title: 'Water Lily Pond',                     artist_title: 'Claude Monet',          image_id: '8534685d-1102-e1e3-e194-94f6e925e8b0' },
  { title: 'The Herring Net',                     artist_title: 'Winslow Homer',         image_id: '5dca7347-c6dc-24dd-d073-d705b9cdc575' },
  { title: 'The Millinery Shop',                  artist_title: 'Edgar Degas',           image_id: '6f513908-03cc-b974-633b-adfce56b7936' },
  { title: 'Houses at Murnau',                    artist_title: 'Vasily Kandinsky',      image_id: '3f732b69-0ae7-7d1e-ad53-e20b0cc2de72' },
  { title: 'Improvisation No. 30 (Cannons)',       artist_title: 'Vasily Kandinsky',      image_id: 'b5bc6b66-9e6e-fe57-dcec-fc49e820e904' },
  { title: 'Stacks of Wheat (End of Summer)',      artist_title: 'Claude Monet',          image_id: 'a38e2828-ec6f-ece1-a30f-70243449197b' },
  { title: 'The Fountain, Villa Torlonia',         artist_title: 'John Singer Sargent',   image_id: '3f9aa9db-61e1-7060-fdb0-bfd7e41ddd08' },
  { title: 'Cliff Walk at Pourville',              artist_title: 'Claude Monet',          image_id: 'b0effb1c-ff23-bbaa-f809-9fd94e31c1a0' },
];

const escapeHtml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Les imatges passen pel proxy local: artic.edu bloqueja el hotlinking.
const imageUrl = (imageId) =>
  `${IMAGE_PROXY}?id=${encodeURIComponent(imageId)}&w=600`;

const barrejar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const omplirColumna = (items, colIdx) => {
  // Rotate starting position per column so adjacent columns show different artworks
  const offset = Math.round((colIdx / N_COLUMNES) * items.length);
  const rotades = [...items.slice(offset), ...items.slice(0, offset)];
  const res = [];
  while (res.length < MIN_PER_COLUMNA) res.push(...rotades);
  return res.slice(0, Math.max(MIN_PER_COLUMNA, rotades.length));
};

const tileMarcup = ({ title, artist_title, image_id }) => {
  const label = `${title || 'Obra'} — ${artist_title || ''}`;
  return `<figure class="art-tile" title="${escapeHtml(label)}">` +
    `<img src="${imageUrl(image_id)}" alt="" loading="lazy" decoding="async">` +
    `</figure>`;
};

const renderitzarMur = (artworks) => {
  const wall = document.getElementById('art-wall');
  if (!wall) return;

  const preparades = barrejar(artworks.filter(a => a && a.image_id));
  if (preparades.length === 0) return;

  wall.innerHTML = Array.from({ length: N_COLUMNES }, (_, c) => {
    const dir   = c % 2 === 0 ? 'art-column--up' : 'art-column--down';
    const items = omplirColumna(preparades, c);
    const tiles = [...items, ...items].map(tileMarcup).join('');
    return `<div class="art-column ${dir} art-column--dur-${c}">` +
      `<div class="art-column__track">${tiles}</div></div>`;
  }).join('');
};

const inicialitzarMurArt = async () => {
  const wall = document.getElementById('art-wall');
  if (!wall) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Fallback immediat — evita pantalla buida
  renderitzarMur(FALLBACK_ARTWORKS);

  try {
    const resp = await fetch('api/get-artic-api.php');
    if (!resp.ok) return;
    const dades = await resp.json();
    // Normalitzem la resposta de l'API PHP al format que espera renderitzarMur
    const artworks = dades
      .filter(o => o?.imageId)
      .map(o => ({
        title:        o.title  || '',
        artist_title: o.artist || '',
        image_id:     o.imageId,
      }));
    if (artworks.length >= 5) renderitzarMur(artworks);
  } catch (_) { /* es manté el fallback */ }
};

document.addEventListener('DOMContentLoaded', () => {
  inicialitzarMurArt();
  compensarCentratHero();
  inicialitzarParallax();
  inicialitzarTicket();
});

const compensarCentratHero = () => {
  const stage = document.querySelector('.hero-stage');
  const header = document.querySelector('.capçalera--fosca');
  const footer = document.querySelector('.peu');
  if (!stage || !header || !footer) return;

  let rafId = 0;

  const actualitzar = () => {
    rafId = 0;
    const headerHeight = header.getBoundingClientRect().height;
    const footerHeight = footer.getBoundingClientRect().height;
    const offset = Math.round((footerHeight - headerHeight) / 2);
    stage.style.transform = `translateY(${offset}px)`;
  };

  const programar = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(actualitzar);
  };

  programar();
  window.addEventListener('resize', programar, { passive: true });
  document.fonts?.ready?.then(programar).catch(() => {});

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(programar);
    observer.observe(header);
    observer.observe(footer);
  }
};

const inicialitzarParallax = () => {
  const card = document.querySelector('.hero-panel');
  if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let tx = 0, ty = 0, mx = 0, my = 0;
  const MAX = 18;

  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2 * MAX;
    my = (e.clientY / window.innerHeight - 0.5) * 2 * MAX;
  });

  let actiu = true;
  const tick = () => {
    if (actiu) {
      tx += (mx - tx) * 0.07;
      ty += (my - ty) * 0.07;
      card.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Atura el parallax quan s'inicia la transició ticket
  document.addEventListener('ticket-iniciat', () => { actiu = false; });
};

const inicialitzarTicket = () => {
  const cta     = document.getElementById('cta-entrar');
  const overlay = document.getElementById('ticket-overlay');
  const envoltori = document.getElementById('ticket-envoltori');
  const dataEl  = document.getElementById('tkt-data');
  if (!cta || !overlay || !envoltori) return;

  // Escriure la data actual al ticket
  if (dataEl) {
    const ara = new Date();
    const dd  = String(ara.getDate()).padStart(2, '0');
    const mm  = String(ara.getMonth() + 1).padStart(2, '0');
    dataEl.textContent = `${dd} · ${mm} · ${ara.getFullYear()}`;
  }

  cta.addEventListener('click', (e) => {
    e.preventDefault();
    const desti = cta.href;

    document.dispatchEvent(new Event('ticket-iniciat'));

    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('actiu');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      envoltori.classList.add('tkt-dins');
    }));

    setTimeout(() => envoltori.classList.add('tkt-sacseja'), 1150);
    setTimeout(() => {
      envoltori.classList.remove('tkt-sacseja');
      envoltori.classList.add('tkt-esquinçat');
    }, 1400);
    setTimeout(() => {
      const audio = document.getElementById('musica');
      const destiUrl = new URL(desti, window.location.href);
      if (audio && Number.isFinite(audio.currentTime)) {
        const tempsActual = String(audio.currentTime);
        try {
          sessionStorage.setItem(MUSIC_RESUME_KEY, tempsActual);
        } catch (_) {}
        destiUrl.searchParams.set(MUSIC_TIME_PARAM, tempsActual);
      }
      window.location.href = destiUrl.toString();
    }, 2050);
  });
};
