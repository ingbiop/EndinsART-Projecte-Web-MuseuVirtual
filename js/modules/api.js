// Funcions reutilitzables per a peticions fetch — EndinsART

export const getJSON = async (url) => {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Error HTTP ${resposta.status} en carregar ${url}`);
  return resposta.json();
};

export const postJSON = async (url, data) => {
  const resposta = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  if (!resposta.ok) throw new Error(`Error HTTP ${resposta.status} en enviar a ${url}`);
  return resposta.json();
};
