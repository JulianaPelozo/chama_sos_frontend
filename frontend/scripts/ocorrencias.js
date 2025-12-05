const ocorrenciasList = document.getElementById('ocorrenciasList');

const fetchOcorrencias = async () => {
  try {
    const res = await fetch('http://SEU_IP:3000/ocorrencias'); // Substitua SEU_IP
    const data = await res.json();

    ocorrenciasList.innerHTML = '';

    if (data.length === 0) {
      ocorrenciasList.innerHTML = `<p>Nenhuma ocorrência cadastrada.</p>`;
      return;
    }

    data.forEach((oc) => {
      const card = document.createElement('div');
      card.className = 'col-md-4';

      card.innerHTML = `
        <div class="card dashboard-card shadow">
          <h5>${oc.tipo} - ${oc.bairro}</h5>
          <p>Prioridade: ${oc.prioridade}</p>
          <p>Status: ${oc.status}</p>
          <p>Vítimas: ${oc.vitimas || 0}</p>
          <p>Custo: R$ ${oc.custo || 0}</p>
          <p>Batalhão: ${oc.batalhao || '-'}</p>
          <button class="btn btn-danger w-100" onclick="editarOcorrencia('${oc.id}')">Editar</button>
        </div>
      `;

      ocorrenciasList.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    ocorrenciasList.innerHTML = `<p>Erro ao carregar ocorrências.</p>`;
  }
};

const editarOcorrencia = (id) => {
  window.location.href = `nova-ocorrencia.html?id=${id}`;
};

fetchOcorrencias();
