// Plànol interactiu + cerca d'obres — EndinsART
import { getJSON } from './modules/api.js';
import { isRoomVisited, getVisitedRooms, ROOMS } from './modules/storage.js';
import { escapeHTML } from './modules/dom.js';

document.addEventListener('DOMContentLoaded', () => {
  actualitzarMapa();
  iniciarCerca();
  fadeEntrada();
});

const fadeEntrada = () => {
  const overlay = document.getElementById('page-entrada');
  if (!overlay) return;
  requestAnimationFrame(() => {
    overlay.classList.add('is-fora');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  });
};

// ─── Mapa de sales visitades ──────────────────────────────────────────────────

const actualitzarMapa = () => {
  const planol = document.querySelector('.planol');
  if (!planol) return;

  ROOMS.forEach(roomId => {
    const sala = planol.querySelector(`[data-room="${roomId}"]`);
    if (!sala) return;

    if (isRoomVisited(roomId)) {
      sala.classList.add('is-visitada');
      const labelActual = sala.getAttribute('aria-label') ?? '';
      if (!labelActual.includes('visitada')) {
        sala.setAttribute('aria-label', `${labelActual} — Ja visitada`);
      }
    }
  });

  const visitades = getVisitedRooms().length;
  const progres   = document.querySelector('.js-progres');
  if (progres) {
    progres.textContent = `Has visitat ${visitades} de ${ROOMS.length} sales`;
  }
};

// ─── Cerca d'obres ────────────────────────────────────────────────────────────

// La Sala 3 queda fora de la cerca: les seves obres canvien a cada visita.
const FONTS = [
  { url: 'data/expo1.json', page: 'expo1.php', sala: 'Sala 1 · Art Digital Interactiu' },
  { url: 'data/expo2.json', page: 'expo2.php', sala: 'Sala 2 · Objectes Animats'       },
];

let indexObres = [];

const iniciarCerca = async () => {
  const input    = document.getElementById('cerca-input');
  const dropdown = document.getElementById('cerca-dropdown');
  if (!input || !dropdown) return;

  // Carrega totes les obres en segon pla
  const resultats = await Promise.allSettled(
    FONTS.map(f => getJSON(f.url))
  );

  resultats.forEach((res, i) => {
    if (res.status !== 'fulfilled' || !Array.isArray(res.value)) return;
    const { page, sala } = FONTS[i];
    res.value.forEach((obra, index) => {
      indexObres.push({
        title:  obra.title  ?? '',
        artist: obra.artist ?? '',
        sala,
        url: `${page}?obra=${index}`,
      });
    });
  });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { tancarDropdown(input, dropdown); return; }

    const trobats = indexObres
      .filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.artist.toLowerCase().includes(q)
      )
      .slice(0, 8);

    renderitzarDropdown(trobats, input, dropdown);
  });

  // Tanca en perdre el focus (delay per deixar que el clic al resultat registri)
  input.addEventListener('blur', () => {
    setTimeout(() => tancarDropdown(input, dropdown), 160);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { tancarDropdown(input, dropdown); input.blur(); }
  });
};

const renderitzarDropdown = (obres, input, dropdown) => {
  dropdown.innerHTML = '';

  if (!obres.length) {
    dropdown.innerHTML = '<p class="cerca__buit">Cap resultat</p>';
    dropdown.removeAttribute('hidden');
    input.setAttribute('aria-expanded', 'true');
    return;
  }

  obres.forEach(o => {
    const item = document.createElement('a');
    item.href      = o.url;
    item.role      = 'option';
    item.className = 'cerca__resultat';
    item.innerHTML = `
      <span class="cerca__resultat-titol">${escapeHTML(o.title)}</span>
      <span class="cerca__resultat-meta">${escapeHTML(o.artist)} · ${escapeHTML(o.sala)}</span>
    `;
    dropdown.appendChild(item);
  });

  dropdown.removeAttribute('hidden');
  input.setAttribute('aria-expanded', 'true');
};

const tancarDropdown = (input, dropdown) => {
  dropdown.setAttribute('hidden', '');
  input.setAttribute('aria-expanded', 'false');
};
