// Slider compartit per a totes les exposicions — EndinsART
import { getJSON } from './modules/api.js';
import { markRoomVisited } from './modules/storage.js';
import { speak, stopSpeaking, isSpeechSupported } from './modules/audioguia.js';
import { openModal } from './modules/modal.js';
import { escapeHTML } from './modules/dom.js';
import { renderArtworkScene, cleanupArtworkScene } from './modules/artwork-renderers.js';

let obres = [];
let indexActual = 0;
let escenaRefs = null;
let utteranceActual = null;

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.querySelector('main[data-room]');
  if (!main) return;

  escenaRefs = {
    sceneEl: document.querySelector('.js-obra-escena'),
    imageEl: document.getElementById('obra-imatge'),
    renderEl: document.querySelector('.js-obra-render'),
    hintEl: document.querySelector('.js-obra-pista'),
  };

  const marc  = document.getElementById('marc-obra');
  const placa = document.getElementById('placa');
  if (marc && placa) {
    new ResizeObserver(() => { placa.style.width = marc.offsetWidth + 'px'; }).observe(marc);
  }

  const roomId = main.dataset.room;
  const source = main.dataset.source;
    const exitUrl = main.dataset.exit ?? 'mapa.php';

  markRoomVisited(roomId);

  try {
    obres = await getJSON(source);
  } catch (err) {
    console.error('[EndinsART] Error carregant obres:', err);
    mostrarError(exitUrl);
    return;
  }

  if (!Array.isArray(obres) || obres.length === 0) {
    mostrarError(exitUrl);
    return;
  }

  construirPunts(obres.length);

  const obraParam = new URLSearchParams(location.search).get('obra');
  const startIndex = obraParam !== null
    ? Math.min(Math.max(parseInt(obraParam, 10) || 0, 0), obres.length - 1)
    : 0;

  renderitzarObra(startIndex, exitUrl);
  configurarNavegacio(exitUrl);
  configurarTecles(exitUrl);
  configurarAudio();
  configurarInfo();
});

// Renderitzat de l'obra
const renderitzarObra = (index, exitUrl) => {
  indexActual = index;
  const obra = obres[index];
  if (!obra) return;

  const titol = document.getElementById('obra-titol');
  const artista = document.getElementById('obra-artista');
  const anyObra = document.getElementById('obra-any');

  if (escenaRefs) renderArtworkScene(escenaRefs, obra);

  if (titol) titol.textContent = obra.title ?? '';
  if (artista) renderArtistLine(artista, obra);
  if (anyObra) {
    anyObra.textContent = obra.year ?? '';
    anyObra.hidden = !obra.year;
  }

  // If the title wraps to more than one line, inline year with artist to save space
  if (obra.year && anyObra && artista && titol) {
    requestAnimationFrame(() => {
      if (obres[indexActual]?.id !== obra.id) return;
      const lh = parseFloat(getComputedStyle(titol).lineHeight);
      if (lh && titol.scrollHeight > lh * 1.5) {
        anyObra.hidden = true;
        renderArtistLine(artista, obra, { inlineYear: true });
      }
    });
  }

  actualitzarPunts(index);
  actualitzarFletxes(index);
  actualitzarNavSortida(index, exitUrl);

  // Atura l'àudio en canviar d'obra
  stopSpeaking();
  restablirBotoAudio(document.querySelector('.js-audio-boto'));
};

// Punts de progrés
const construirPunts = (total) => {
  const contenidor = document.querySelector('.js-punts');
  if (!contenidor) return;

  contenidor.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const punt = document.createElement('span');
    punt.className = 'punt';
    punt.setAttribute('role', 'listitem');
    punt.setAttribute('aria-label', `Obra ${i + 1}`);
    contenidor.appendChild(punt);
  }
};

const actualitzarPunts = (index) => {
  document.querySelectorAll('.js-punts .punt').forEach((punt, i) => {
    const actiu = i === index;
    punt.classList.toggle('actiu', actiu);
    punt.setAttribute('aria-current', actiu ? 'true' : 'false');
  });
};

// Fletxes de navegació
const actualitzarFletxes = (index) => {
  const prev = document.querySelector('.js-anterior');
  const next = document.querySelector('.js-seguent');

  if (prev) {
    const amagat = index === 0;
    prev.hidden = amagat;
    prev.setAttribute('aria-hidden', String(amagat));
  }

  if (next) {
    const amagat = index === obres.length - 1;
    next.hidden = amagat;
    next.setAttribute('aria-hidden', String(amagat));
  }
};

// Icona de sortida al botó de mapa quan s'arriba a l'última obra
const actualitzarNavSortida = (index, exitUrl) => {
  const link = document.querySelector('.js-nav-mapa');
  if (!link) return;
  const mapSvg   = link.querySelector('.js-nav-map-svg');
  const exitIcon = link.querySelector('.js-nav-exit-icon');
  const esUltima = index === obres.length - 1;

  link.href = esUltima ? exitUrl : 'mapa.php';
  link.classList.toggle('is-exit-state', esUltima);
  link.setAttribute('aria-label', esUltima ? "Sortir de l'exposició" : 'Mapa del museu');
  if (mapSvg) {
    mapSvg.toggleAttribute('hidden', esUltima);
    mapSvg.setAttribute('aria-hidden', String(esUltima));
  }
  if (exitIcon) {
    exitIcon.toggleAttribute('hidden', !esUltima);
    exitIcon.setAttribute('aria-hidden', String(!esUltima));
  }
};

// Navegació prev/next
const configurarNavegacio = (exitUrl) => {
  document.querySelector('.js-anterior')?.addEventListener('click', () => {
    if (indexActual > 0) renderitzarObra(indexActual - 1, exitUrl);
  });

  document.querySelector('.js-seguent')?.addEventListener('click', () => {
    if (indexActual < obres.length - 1) renderitzarObra(indexActual + 1, exitUrl);
  });
};

const configurarTecles = (exitUrl) => {
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal.is-visible')) return;
    if (e.key === 'ArrowLeft' && indexActual > 0) renderitzarObra(indexActual - 1, exitUrl);
    if (e.key === 'ArrowRight' && indexActual < obres.length - 1) renderitzarObra(indexActual + 1, exitUrl);
  });
};

// Audioguia
const restablirBotoAudio = (boto) => {
  utteranceActual = null;
  if (!boto) return;
  boto.classList.remove('is-reproduint');
  boto.setAttribute('aria-label', 'Escoltar audioguia');
};

const configurarAudio = () => {
  const boto = document.querySelector('.js-audio-boto');
  if (!boto || !isSpeechSupported()) {
    boto?.setAttribute('hidden', '');
    return;
  }

  boto.addEventListener('click', () => {
    const obra = obres[indexActual];
    if (!obra) return;

    if (window.speechSynthesis.speaking) {
      stopSpeaking();
      restablirBotoAudio(boto);
      return;
    }

    utteranceActual = speak(obra.audioText ?? obra.title ?? '', 'ca-ES');
    boto.classList.add('is-reproduint');
    boto.setAttribute('aria-label', 'Aturar audioguia');

    if (utteranceActual) {
      const alFinalitzar = () => restablirBotoAudio(boto);
      utteranceActual.onend = alFinalitzar;
      utteranceActual.onerror = alFinalitzar;
    }
  });
};

// Modal d'informació
const configurarInfo = () => {
  const main = document.querySelector('main[data-room]');
  const amagarDesc = main?.dataset.hideDesc === 'true';

  document.querySelector('.js-info-boto')?.addEventListener('click', () => {
    const obra = obres[indexActual];
    if (!obra) return;

    const metaRows = [
      ['Artista', obra.artist],
      ['Any',     netejarTextModal(obra.year)],
      ['Lloc',    netejarTextModal(obra.origin)],
      ['Tècnica', netejarTextModal(obra.medium)],
      ['Moviment', netejarTextModal(obra.style)],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd>`)
      .join('');

    const desc = amagarDesc ? '' : netejarTextModal(obra.description ?? obra.shortDescription ?? '');

    openModal(`
      <dl class="modal__meta">
        <dt>Títol</dt><dd id="modal-titol">${escapeHTML(obra.title)}</dd>
        ${metaRows}
      </dl>
      ${desc ? `<p>${escapeHTML(desc)}</p>` : ''}
    `);
  });
};

// Helpers d'UI
const mostrarError = (exitUrl) => {
  if (escenaRefs) cleanupArtworkScene(escenaRefs);

  const main = document.querySelector('main');
  if (!main) return;

  main.innerHTML = `
    <div class="expo-error-state">
      <p class="expo-error-state__text">No s'han pogut carregar les obres. Comprova la connexió i torna-ho a intentar.</p>
      <a href="${escapeHTML(exitUrl)}" class="boto boto--primari">Tornar</a>
    </div>
  `;
};

const netejarTextModal = (valor) => {
  if (typeof valor !== 'string') return valor ?? '';

  const text = valor.replace(/\s+/g, ' ').trim();
  if (!text) return '';

  const esTextErrorApi = /QUERY LENGTH LIMIT EXCEEDED|MYMEMORY WARNING/i.test(text);
  const esPlaceholderGeneric = /^Art Institute of Chicago\.?$/i.test(text);
  return (esTextErrorApi || esPlaceholderGeneric) ? '' : text;
};

const renderArtistLine = (element, obra, options = {}) => {
  const { inlineYear = false } = options;
  const artistText = obra?.artist ?? '';
  const yearText = obra?.year ?? '';
  const codepenUrl = obra?.codepenUrl ?? '';

  element.replaceChildren();

  if (artistText) {
    if (codepenUrl && artistText.startsWith('Inspirat en ')) {
      const artistName = artistText.slice('Inspirat en '.length).trim();
      element.append(document.createTextNode(`Inspirat en ${artistName}'s`));
    } else {
      element.append(document.createTextNode(artistText));
    }
  }

  if (codepenUrl) {
    const link = document.createElement('a');
    link.href = codepenUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'placa__enllac';
    link.textContent = 'codepen';
    element.append(link);
  }

  if (inlineYear && yearText) {
    element.append(document.createTextNode(` · ${yearText}`));
  }
};
