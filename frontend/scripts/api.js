const API_URL = 'http://SEU_IP:3000';

export async function fetchOcorrencias() {
  const res = await fetch(`${API_URL}/ocorrencias`);
  if (!res.ok) throw new Error('Falha ao buscar ocorrências');
  return res.json();
}

export async function criarOcorrencia(data) {
  const res = await fetch(`${API_URL}/ocorrencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Falha ao cadastrar ocorrência');
  return res.json();
}
