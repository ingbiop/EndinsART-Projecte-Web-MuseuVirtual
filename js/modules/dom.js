// Utilitats de DOM compartides — EndinsART

// Escapa text per inserir-lo de forma segura dins d'HTML (innerHTML, atributs).
export const escapeHTML = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
