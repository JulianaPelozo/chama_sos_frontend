const params = new URLSearchParams(window.location.search);
const idParam = params.get('id');

const formTitle = document.getElementById('formTitle');
const formOcorrencia = document.getElementById('formOcorrencia');
const erro = document.getElementById('erro');

const tipo = document.getElementById('tipo');
const bairro = document.getElementById('bairro');
const prioridade = document.getElementById('prioridade');
const status = document.getElementById('status');
const vitimas = document.getElementById('vitimas');
const custo = document.getElementById('custo');
const batalhao = document.getElementById('batalhao');

const apiUrl = 'http://SEU_IP:3000/ocorrencias'; 

const fetchOcorrencia = async (id) => {
  try {
    const res = await fetch(`${apiUrl}/${id}`);
    const data = await res.json();

    tipo.value = data.tipo;
    bairro.value = data.bairro;
    prioridade.value = data.prioridade;
    status.value = data.status;
    vitimas.value = data.vitimas || '';
    custo.value = data.custo || '';
    batalhao.value = data.batalhao || '';
  } catch (err) {
    console.error(err);
    erro.textContent = 'Erro ao carregar ocorrência';
  }
};

if (idParam) {
  formTitle.textContent = 'Editar Ocorrência';
  fetchOcorrencia(idParam);
}

formOcorrencia.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!tipo.value || !bairro.value) {
    erro.textContent = 'Preencha os campos obrigatórios';
    return;
  }

  const payload = {
    tipo: tipo.value,
    bairro: bairro.value,
    prioridade: prioridade.value,
    status: status.value,
    vitimas: vitimas.value,
    custo: custo.value,
    batalhao: batalhao.value,
  };

  try {
    const method = idParam ? 'PUT' : 'POST';
    const url = idParam ? `${apiUrl}/${idParam}` : apiUrl;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Erro ao salvar');

    window.location.href = 'ocorrencias.html';
  } catch (err) {
    console.error(err);
    erro.textContent = 'Erro ao salvar ocorrência';
  }
});
