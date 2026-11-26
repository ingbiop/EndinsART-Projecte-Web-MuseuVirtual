const MUSIC_RESUME_KEY = 'endinsartIntroMusicTime';
const MUSIC_TIME_PARAM = 'musicTime';
const CONTINUOUS_TRACK_NAME = 'acapulco - Jazeboo Soundcloud.mp3';

document.addEventListener('DOMContentLoaded', () => {
  inicialitzarHamburguesa();
  marcarNavActiva();
  inicialitzarMusica();
});

const obtenirPaginaActual = () => window.location.pathname.split('/').pop() || 'index.php';

const esPaginaMapa = () => obtenirPaginaActual() === 'mapa.php';
const esPaginaInici = () => obtenirPaginaActual() === 'index.php';

const esPistaContinua = (audio) => {
  const src = decodeURIComponent(audio.currentSrc || audio.src || '');
  return src.includes(CONTINUOUS_TRACK_NAME);
};

const inicialitzarHamburguesa = () => {
  const capcalera = document.querySelector('.capçalera');
  const hamburguesa = document.querySelector('.js-hamburguesa');
  if (!capcalera || !hamburguesa) return;

  const establirMenu = (obert) => {
    capcalera.classList.toggle('is-obert', obert);
    hamburguesa.setAttribute('aria-expanded', String(obert));
    hamburguesa.setAttribute('aria-label', obert ? 'Tancar menú' : 'Obrir menú');
    document.body.classList.toggle('sense-scroll', obert);
  };

  hamburguesa.addEventListener('click', () => {
    establirMenu(!capcalera.classList.contains('is-obert'));
  });

  document.querySelectorAll('.capçalera__nav-mobile a').forEach((enll) => {
    enll.addEventListener('click', () => establirMenu(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !capcalera.classList.contains('is-obert')) return;
    establirMenu(false);
    hamburguesa.focus();
  });
};

const marcarNavActiva = () => {
  const paginaActual = obtenirPaginaActual();
  document.querySelectorAll('.capçalera__nav a, .capçalera__nav-mobile a').forEach((enll) => {
    const href = enll.getAttribute('href')?.split('/').pop() ?? '';
    if (href === paginaActual) enll.setAttribute('aria-current', 'page');
  });
};

const esperarMetadadesAudio = (audio) => new Promise((resolve) => {
  if (audio.readyState >= 1) {
    resolve();
    return;
  }

  const resoldre = () => resolve();
  audio.addEventListener('loadedmetadata', resoldre, { once: true });
  audio.load();
});

const establirTempsGuardat = (audio, tempsGuardat) => {
  if (!Number.isFinite(tempsGuardat) || tempsGuardat < 0) return false;

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = Math.min(tempsGuardat, Math.max(0, audio.duration - 0.25));
  } else {
    audio.currentTime = tempsGuardat;
  }

  return true;
};

const restaurarTempsGuardat = async (audio, tempsGuardat) => {
  if (!Number.isFinite(tempsGuardat) || tempsGuardat < 0) return false;

  await esperarMetadadesAudio(audio);
  return establirTempsGuardat(audio, tempsGuardat);
};

const iniciarMusicaDespresInteraccio = (audio, tempsGuardat) => {
  const netejar = () => {
    document.removeEventListener('click', iniciarAlInteraccio);
    document.removeEventListener('keydown', iniciarAlInteraccio);
  };

  const iniciarAlInteraccio = async () => {
    if (!audio.paused) {
      netejar();
      return;
    }

    await restaurarTempsGuardat(audio, tempsGuardat);
    audio.play().catch(() => {});
    netejar();
  };

  document.addEventListener('click', iniciarAlInteraccio);
  document.addEventListener('keydown', iniciarAlInteraccio);
};

const reforcarAutoplay = (audio, tempsGuardat) => {
  let intents = 0;
  let timeoutId = 0;
  let actiu = true;

  const netejar = () => {
    actiu = false;
    window.clearTimeout(timeoutId);
    audio.removeEventListener('canplay', intentar);
    audio.removeEventListener('loadeddata', intentar);
    window.removeEventListener('pageshow', intentar);
    window.removeEventListener('load', intentar);
    document.removeEventListener('visibilitychange', intentarSiVisible);
  };

  const intentarSiVisible = () => {
    if (!document.hidden) {
      void intentar();
    }
  };

  const intentar = async () => {
    if (!actiu || !audio.paused) {
      netejar();
      return;
    }

    intents += 1;

    try {
      await restaurarTempsGuardat(audio, tempsGuardat);
      await audio.play();
      netejar();
      return;
    } catch (_) {
      if (intents >= 6) return;
    }

    timeoutId = window.setTimeout(() => {
      void intentar();
    }, 250);
  };

  audio.addEventListener('canplay', intentar);
  audio.addEventListener('loadeddata', intentar);
  window.addEventListener('pageshow', intentar);
  window.addEventListener('load', intentar);
  document.addEventListener('visibilitychange', intentarSiVisible);

  void intentar();
};

const guardarTempsMusica = (audio) => {
  if (!esPistaContinua(audio) || !Number.isFinite(audio.currentTime)) return;

  try {
    sessionStorage.setItem(MUSIC_RESUME_KEY, String(audio.currentTime));
  } catch (_) {}
};

const netejarParametreTemps = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete(MUSIC_TIME_PARAM);
  const urlNeta = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, '', urlNeta);
};

const obtenirValorTemps = (valor) => {
  const temps = Number.parseFloat(valor ?? '');
  return Number.isFinite(temps) && temps >= 0 ? temps : Number.NaN;
};

const obtenirTempsGuardat = () => {
  if (!esPaginaMapa()) return Number.NaN;

  const url = new URL(window.location.href);
  const tempsUrl = obtenirValorTemps(url.searchParams.get(MUSIC_TIME_PARAM));
  let tempsStorage = Number.NaN;

  try {
    tempsStorage = obtenirValorTemps(sessionStorage.getItem(MUSIC_RESUME_KEY));
    sessionStorage.removeItem(MUSIC_RESUME_KEY);
  } catch (_) {
    tempsStorage = Number.NaN;
  }

  if (Number.isFinite(tempsUrl)) {
    netejarParametreTemps();
  }

  if (Number.isFinite(tempsUrl) && Number.isFinite(tempsStorage)) {
    return Math.max(tempsUrl, tempsStorage);
  }

  if (Number.isFinite(tempsStorage)) return tempsStorage;
  return tempsUrl;
};

const inicialitzarMusica = async () => {
  const audio = document.getElementById('musica');
  if (!audio) return;

  audio.autoplay = true;

  if (esPaginaInici() && esPistaContinua(audio)) {
    window.addEventListener('pagehide', () => guardarTempsMusica(audio), { once: true });
  }

  const tempsGuardat = obtenirTempsGuardat();

  try {
    await restaurarTempsGuardat(audio, tempsGuardat);
    await audio.play();
  } catch (_) {
    if (esPaginaInici()) {
      reforcarAutoplay(audio, tempsGuardat);
    }
    iniciarMusicaDespresInteraccio(audio, tempsGuardat);
  }
};
