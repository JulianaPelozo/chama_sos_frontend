import { fetchOcorrencias } from './api.js';

export async function showDashboard(content) {
  const data = await fetchOcorrencias();
  const ocorrenciasHoje = data.length;
  const ocorrenciasAtivas = data.filter(o => o.status === 'Ativa').length;
  const tempoMedioResposta = '8.5min'; // fixo por enquanto
  const bairrosCriticos = [...new Set(data.map(o => o.bairro))].slice(0,3);

  content.innerHTML = `
    <div class="row">
      <div class="col-md-12">
        <div class="card p-3">
          <h4>Bombeiro Silva, seja bem-vindo!</h4>
          <p>Região Metropolitana do Recife</p>
          <p>Turno: 07:00 - 19:00</p>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card p-3 text-center">
          <h5>Ocorrências hoje</h5>
          <h2 class="text-primary">${ocorrenciasHoje}</h2>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 text-center">
          <h5>Ativas</h5>
          <h2 class="text-danger">${ocorrenciasAtivas}</h2>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card p-3 text-center">
          <h5>Tempo médio</h5>
          <h2>${tempoMedioResposta}</h2>
        </div>
      </div>

      <div class="col-md-12">
        <div class="card p-3">
          <h5>Bairros com mais ocorrências</h5>
          ${bairrosCriticos.map(b => `<span class="badge bg-danger me-1">${b}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}