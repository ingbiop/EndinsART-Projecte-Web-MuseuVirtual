// Renderitzat de ressenyes i valoració mitjana — EndinsART
import { escapeHTML } from './dom.js';

const starsHTML = (rating) => {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span aria-hidden="true">${i <= rating ? '★' : '☆'}</span>`;
  }
  return html;
};

export const renderAverage = (container, avg, count) => {
  if (!container) return;

  const text = count === 0
    ? 'Sense valoracions'
    : count === 1 ? '1 ressenya' : `${count} ressenyes`;

  container.innerHTML = `
    <div class="mitjana__numero">${avg > 0 ? avg.toFixed(1) : '—'}</div>
    <div>
      <div class="mitjana__estrelles" aria-label="Valoració mitjana: ${avg} de 5">
        ${avg > 0 ? starsHTML(Math.round(avg)) : ''}
      </div>
      <p class="mitjana__text">${text}</p>
    </div>
  `;
};

export const renderReviews = (container, reviews) => {
  if (!container) return;

  const buit = container.querySelector('.visites-buit');
  container.querySelectorAll('.ressenya').forEach((el) => el.remove());

  if (!reviews || reviews.length === 0) {
    if (buit) buit.removeAttribute('hidden');
    return;
  }

  if (buit) buit.setAttribute('hidden', '');

  const fragment = document.createDocumentFragment();

  reviews.forEach((r) => {
    const article = document.createElement('article');
    article.className = 'ressenya';
    const data = r.created_at
      ? new Date(r.created_at).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';

    article.innerHTML = `
      <div class="ressenya__cap">
        <span class="ressenya__nom">${escapeHTML(r.name)}</span>
        <span class="ressenya__estrelles" aria-label="${r.rating} de 5 estrelles">${starsHTML(r.rating)}</span>
      </div>
      <p class="ressenya__comentari">${escapeHTML(r.comment)}</p>
      ${data ? `<time class="ressenya__data" datetime="${escapeHTML(r.created_at)}">${data}</time>` : ''}
    `;
    fragment.appendChild(article);
  });

  container.appendChild(fragment);
};
