// Modal accessible amb focus trap — EndinsART

const FOCUSABLES = 'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

let anteriorFocus  = null;
let listenerEscape = null;
let listenerFora   = null;

export const openModal = (htmlContingut) => {
  let modal = document.querySelector('.modal');

  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-titol');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal__caixa">
      <button class="modal__tanca js-modal-tanca" aria-label="Tancar">✕</button>
      <div class="modal__contingut">${htmlContingut}</div>
    </div>
  `;

  modal.classList.add('is-visible');
  document.body.classList.add('sense-scroll');
  anteriorFocus = document.activeElement;
  modal.querySelector('.js-modal-tanca')?.focus();

  listenerEscape = (e) => { if (e.key === 'Escape') closeModal(); };
  listenerFora   = (e) => { if (e.target === modal) closeModal(); };

  document.addEventListener('keydown', listenerEscape);
  modal.addEventListener('click', listenerFora);
  modal.querySelector('.js-modal-tanca')?.addEventListener('click', closeModal);
  modal.addEventListener('keydown', gestionarFocusTrap);
};

export const closeModal = () => {
  const modal = document.querySelector('.modal');
  if (!modal) return;

  modal.classList.remove('is-visible');
  document.body.classList.remove('sense-scroll');

  if (listenerEscape) document.removeEventListener('keydown', listenerEscape);
  if (listenerFora)   modal.removeEventListener('click', listenerFora);
  modal.removeEventListener('keydown', gestionarFocusTrap);

  anteriorFocus?.focus();
};

const gestionarFocusTrap = (e) => {
  if (e.key !== 'Tab') return;

  const modal     = document.querySelector('.modal');
  const focusable = Array.from(modal.querySelectorAll(FOCUSABLES))
    .filter(el => !el.disabled && el.offsetParent !== null);

  if (!focusable.length) return;

  const primer = focusable[0];
  const darrer = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === primer) {
    e.preventDefault();
    darrer.focus();
  } else if (!e.shiftKey && document.activeElement === darrer) {
    e.preventDefault();
    primer.focus();
  }
};
