// Audioguia per síntesi de veu (Web Speech API) — EndinsART

export const isSpeechSupported = () => 'speechSynthesis' in window;

const REGEX_CATALA   = /^ca(?:[-_]|$)/i;
const REGEX_ESPANYOL = /^es(?:[-_]|$)/i;
let veusDisponibles = [];

const actualitzarVeus = () => {
  if (!isSpeechSupported()) return;
  veusDisponibles = window.speechSynthesis.getVoices();
};

// Retorna { voice, lang } amb la millor veu disponible per al català.
// Ordre de prioritat: veu catalana → veu espanyola (fonèticament propera) → cap.
const obtenirVeuOptima = () => {
  const veus = veusDisponibles.length > 0 ? veusDisponibles : window.speechSynthesis.getVoices();

  const veuCa = veus.find((veu) => REGEX_CATALA.test(veu.lang))
    ?? veus.find((veu) => /catal/i.test(`${veu.name ?? ''} ${veu.voiceURI ?? ''}`));
  if (veuCa) return { voice: veuCa, lang: veuCa.lang || 'ca-ES' };

  // Fallback: espanyol és fonèticament el més proper al català disponible als SO habituals
  const veuEs = veus.find((veu) => /^es-ES/i.test(veu.lang))
    ?? veus.find((veu) => REGEX_ESPANYOL.test(veu.lang));
  if (veuEs) return { voice: veuEs, lang: 'ca-ES' };

  return null;
};

if (isSpeechSupported()) {
  actualitzarVeus();

  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', actualitzarVeus);
  } else {
    window.speechSynthesis.onvoiceschanged = actualitzarVeus;
  }
}

export const speak = (text, lang = 'ca-ES') => {
  if (!isSpeechSupported()) return null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const resultat  = obtenirVeuOptima();
  utterance.lang  = resultat?.lang || lang;
  if (resultat?.voice) utterance.voice = resultat.voice;
  utterance.rate   = 0.9;
  utterance.pitch  = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};
