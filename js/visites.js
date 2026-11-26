// Gestió del llibre de ressenyes — EndinsART
import { getJSON, postJSON }            from './modules/api.js';
import { renderReviews, renderAverage } from './modules/reviews.js';
import { validateReview }               from './modules/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  carregarRessenyes();
  inicialitzarFormulari();
});

const carregarRessenyes = async () => {
  const containerLlista  = document.querySelector('.js-llista');
  const containerMitjana = document.querySelector('.js-mitjana');

  try {
    const { reviews, average, count } = await getJSON('api/get-reviews.php');
    renderAverage(containerMitjana, average, count);
    renderReviews(containerLlista, reviews);
  } catch {
    if (containerLlista) {
      const buit = containerLlista.querySelector('.visites-buit');
      if (buit) buit.textContent = 'No s\'han pogut carregar les ressenyes.';
    }
  }
};

const inicialitzarFormulari = () => {
  const formulari = document.getElementById('forma-ressenya');
  if (!formulari) return;

  formulari.addEventListener('submit', async (e) => {
    e.preventDefault();
    netejarErrors();

    const nomEl       = formulari.querySelector('#nom');
    const ratingEl    = formulari.querySelector('input[name="rating"]:checked');
    const comentariEl = formulari.querySelector('#comentari');
    const feedback    = formulari.querySelector('.js-feedback');
    const boto        = formulari.querySelector('.js-boto-enviar');

    const dades = {
      name:    nomEl?.value.trim()       ?? '',
      rating:  ratingEl?.value           ?? '',
      comment: comentariEl?.value.trim() ?? '',
    };

    const { valid, errors } = validateReview(dades);

    if (!valid) {
      mostrarErrors(formulari, errors);
      return;
    }

    if (boto) {
      boto.disabled = true;
      boto.textContent = 'Enviant…';
    }

    try {
      await postJSON('api/save-review.php', {
        name: dades.name,
        rating: parseInt(dades.rating, 10),
        comment: dades.comment,
      });

      formulari.reset();
      mostrarFeedback(feedback, 'Gràcies per la teva ressenya!', true);
      await carregarRessenyes();
    } catch {
      mostrarFeedback(feedback, 'Error en enviar la ressenya. Torna-ho a intentar.', false);
    } finally {
      if (boto) {
        boto.disabled = false;
        boto.textContent = 'Enviar ressenya';
      }
    }
  });
};

const netejarErrors = () => {
  document.querySelectorAll('.camp__error').forEach((el) => {
    el.textContent = '';
    el.setAttribute('hidden', '');
  });

  document.querySelectorAll('[aria-invalid]').forEach((el) => {
    el.removeAttribute('aria-invalid');
  });
};

const mostrarErrors = (formulari, errors) => {
  if (errors.name) mostrarError(formulari, '#nom', 'error-nom', errors.name);
  if (errors.rating) mostrarError(formulari, null, 'error-rating', errors.rating);
  if (errors.comment) mostrarError(formulari, '#comentari', 'error-comentari', errors.comment);
};

const mostrarError = (formulari, selectorInput, idError, missatge) => {
  const errorEl = document.getElementById(idError);
  if (errorEl) {
    errorEl.textContent = missatge;
    errorEl.removeAttribute('hidden');
  }

  if (!selectorInput) return;

  const input = formulari.querySelector(selectorInput);
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', idError);
    input.focus();
  }
};

const mostrarFeedback = (el, missatge, ok) => {
  if (!el) return;

  el.textContent = missatge;
  el.className = `ressenya-feedback js-feedback ${ok ? 'ok' : 'err'}`;
  el.removeAttribute('hidden');
  setTimeout(() => el.setAttribute('hidden', ''), 5000);
};
