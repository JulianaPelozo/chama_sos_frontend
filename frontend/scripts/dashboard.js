import { fetchOcorrencias, fetchEstatisticas } from './api.js';
import { getUsuarioAtual } from './auth.js';

export async function showDashboard(content) {
  try {
    content.innerHTML = '<div class="spinner-overlay"><div class="spinner"></div></div>';
    
    const usuario = getUsuarioAtual();
    
    const data = await fetchOcorrencias();
    const estatisticas = await fetchEstatisticas();
    
    const hoje = new Date().toDateString();
    const ocorrenciasHoje = data.filter(o => {
      const dataOcorrencia = new Date(o.data);
      return dataOcorrencia.toDateString() === hoje;
    }).length;
    
    const ocorrenciasAtivas = data.filter(o => o.status === 'Ativa').length;
    const ocorrenciasUrgentes = data.filter(o => o.prioridade === 'Alta').length;
    
    const temposResposta = data
      .filter(o => o.tempoResposta && o.status === 'Concluída')
      .map(o => {
        const tempo = o.tempoResposta.replace('min', '').replace(',', '.');
        return parseFloat(tempo);
      })
      .filter(t => !isNaN(t));
    
    const tempoMedioResposta = temposResposta.length > 0 
      ? (temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length).toFixed(1) + 'min'
      : 'N/A';
    
    const contagemBairros = data.reduce((acc, o) => {
      acc[o.bairro] = (acc[o.bairro] || 0) + 1;
      return acc;
    }, {});
    
    const bairrosCriticos = Object.entries(contagemBairros)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([bairro]) => bairro);
    
    const tiposOcorrencia = data.reduce((acc, o) => {
      acc[o.tipo] = (acc[o.tipo] || 0) + 1;
      return acc;
    }, {});
    
    const tiposMaisComuns = Object.entries(tiposOcorrencia)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    const ultimasOcorrencias = data
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5);
    
    content.innerHTML = `
      <div class="row fade-in">
        <!-- Cabeçalho de boas-vindas -->
        <div class="col-12">
          <div class="card p-4 mb-4 bg-danger text-white shadow">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h4 class="mb-1"><i class="bi bi-shield-check me-2"></i>${usuario?.nome || 'Bombeiro'}, seja bem-vindo!</h4>
                <p class="mb-1">${usuario?.regiao || 'Região Metropolitana do Recife'}</p>
                <p class="mb-1">Turno: ${usuario?.turno || '07:00 - 19:00'}</p>
                <small class="opacity-75">${new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</small>
              </div>
              <div class="text-end mt-2 mt-md-0">
                <div class="badge bg-light text-dark p-2 mb-2 fs-6">
                  <i class="bi bi-person-badge me-1"></i>${usuario?.posto || 'Bombeiro'}
                </div>
                <div>
                  <small>Matrícula: ${usuario?.matricula || 'N/A'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Métricas principais -->
        <div class="col-md-3 col-6 mb-3">
          <div class="card p-3 text-center h-100 shadow-sm">
            <div class="card-body">
              <div class="text-primary mb-2">
                <i class="bi bi-calendar-day fs-1"></i>
              </div>
              <h5 class="card-title text-muted">Hoje</h5>
              <h2 class="text-primary display-6 fw-bold">${ocorrenciasHoje}</h2>
              <p class="card-text small text-muted">
                ${ocorrenciasHoje > 0 ? 'Ocorrências registradas' : 'Sem ocorrências'}
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-6 mb-3">
          <div class="card p-3 text-center h-100 shadow-sm status-ativa">
            <div class="card-body">
              <div class="text-danger mb-2">
                <i class="bi bi-exclamation-triangle fs-1"></i>
              </div>
              <h5 class="card-title text-muted">Ativas</h5>
              <h2 class="text-danger display-6 fw-bold">${ocorrenciasAtivas}</h2>
              <p class="card-text small text-muted">
                ${ocorrenciasAtivas > 0 ? 'Precisam de atenção' : 'Todas controladas'}
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-6 mb-3">
          <div class="card p-3 text-center h-100 shadow-sm">
            <div class="card-body">
              <div class="text-warning mb-2">
                <i class="bi bi-clock-history fs-1"></i>
              </div>
              <h5 class="card-title text-muted">Tempo Médio</h5>
              <h2 class="text-success display-6 fw-bold">${tempoMedioResposta}</h2>
              <p class="card-text small text-muted">
                Resposta média
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 col-6 mb-3">
          <div class="card p-3 text-center h-100 shadow-sm">
            <div class="card-body">
              <div class="text-info mb-2">
                <i class="bi bi-speedometer2 fs-1"></i>
              </div>
              <h5 class="card-title text-muted">Prioridade Alta</h5>
              <h2 class="text-info display-6 fw-bold">${ocorrenciasUrgentes}</h2>
              <p class="card-text small text-muted">
                ${ocorrenciasUrgentes > 0 ? 'Urgências' : 'Nenhuma urgência'}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Bairros críticos -->
        <div class="col-md-6 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-danger text-white">
              <h5 class="mb-0"><i class="bi bi-geo-alt me-2"></i>Bairros Críticos</h5>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2 mb-3">
                ${bairrosCriticos.map((bairro, index) => `
                  <div class="alert ${index === 0 ? 'alert-danger' : index === 1 ? 'alert-warning' : 'alert-info'} d-flex align-items-center p-2">
                    <i class="bi bi-fire me-2"></i>
                    <strong>${bairro}</strong>
                    <span class="ms-2 badge bg-dark">${contagemBairros[bairro]} ocorrências</span>
                  </div>
                `).join('')}
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-danger" style="width: 60%"></div>
                <div class="progress-bar bg-warning" style="width: 25%"></div>
                <div class="progress-bar bg-info" style="width: 15%"></div>
              </div>
              <small class="text-muted mt-2 d-block">Distribuição de ocorrências por bairro</small>
            </div>
          </div>
        </div>
        
        <!-- Tipos de ocorrência -->
        <div class="col-md-6 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-header bg-danger text-white">
              <h5 class="mb-0"><i class="bi bi-list-ul me-2"></i>Tipos Mais Comuns</h5>
            </div>
            <div class="card-body">
              <div class="list-group list-group-flush">
                ${tiposMaisComuns.map(([tipo, quantidade], index) => `
                  <div class="list-group-item d-flex justify-content-between align-items-center py-2">
                    <div>
                      <span class="badge bg-${index === 0 ? 'danger' : index === 1 ? 'warning' : 'secondary'} me-2">${quantidade}</span>
                      ${tipo}
                    </div>
                    <div class="progress flex-grow-1 mx-3" style="height: 6px;">
                      <div class="progress-bar bg-${index === 0 ? 'danger' : index === 1 ? 'warning' : 'secondary'}" 
                           style="width: ${(quantidade / data.length) * 100}%"></div>
                    </div>
                    <span class="text-muted small">${Math.round((quantidade / data.length) * 100)}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Últimas ocorrências -->
        <div class="col-12 mb-4">
          <div class="card shadow-sm">
            <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-activity me-2"></i>Últimas Ocorrências</h5>
              <a href="#" id="verTodasOcorrencias" class="btn btn-sm btn-light">Ver todas</a>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Hora</th>
                      <th>Tipo</th>
                      <th>Local</th>
                      <th>Status</th>
                      <th>Equipe</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ultimasOcorrencias.map(ocorrencia => `
                      <tr class="${ocorrencia.prioridade === 'Alta' ? 'table-danger' : ''}">
                        <td>
                          <small class="text-muted">${new Date(ocorrencia.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</small>
                        </td>
                        <td>
                          <span class="badge bg-${getBadgeColor(ocorrencia.tipo)}">
                            ${ocorrencia.tipo}
                          </span>
                        </td>
                        <td>
                          <strong>${ocorrencia.bairro}</strong><br>
                          <small class="text-muted">${ocorrencia.endereco || ''}</small>
                        </td>
                        <td>
                          <span class="badge bg-${getStatusBadgeColor(ocorrencia.status)}">
                            ${ocorrencia.status}
                          </span>
                        </td>
                        <td>
                          <small>${ocorrencia.equipe || 'A designar'}</small>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary" onclick="verDetalhesOcorrencia('${ocorrencia.id}')">
                            <i class="bi bi-eye"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Ações rápidas -->
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Ações Rápidas</h5>
              <div class="row g-2">
                <div class="col-md-3 col-6">
                  <button class="btn btn-danger w-100 d-flex align-items-center justify-content-center py-3" onclick="app.navigateTo('nova')">
                    <i class="bi bi-plus-circle fs-4 me-2"></i>
                    <div>
                      <div class="fw-bold">Nova Ocorrência</div>
                      <small class="opacity-75">Registrar emergência</small>
                    </div>
                  </button>
                </div>
                <div class="col-md-3 col-6">
                  <button class="btn btn-warning w-100 d-flex align-items-center justify-content-center py-3" onclick="app.navigateTo('ocorrencias')">
                    <i class="bi bi-list-task fs-4 me-2"></i>
                    <div>
                      <div class="fw-bold">Ver Todas</div>
                      <small class="opacity-75">Lista completa</small>
                    </div>
                  </button>
                </div>
                <div class="col-md-3 col-6">
                  <button class="btn btn-info w-100 d-flex align-items-center justify-content-center py-3" onclick="app.atualizarDashboard()">
                    <i class="bi bi-arrow-clockwise fs-4 me-2"></i>
                    <div>
                      <div class="fw-bold">Atualizar</div>
                      <small class="opacity-75">Dados em tempo real</small>
                    </div>
                  </button>
                </div>
                <div class="col-md-3 col-6">
                  <button class="btn btn-success w-100 d-flex align-items-center justify-content-center py-3" onclick="app.exportarRelatorio()">
                    <i class="bi bi-file-earmark-arrow-down fs-4 me-2"></i>
                    <div>
                      <div class="fw-bold">Exportar</div>
                      <small class="opacity-75">Relatório diário</small>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    setupDashboardEventListeners();
    
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    content.innerHTML = `
      <div class="alert alert-danger">
        <h5><i class="bi bi-exclamation-triangle me-2"></i>Erro ao carregar dashboard</h5>
        <p>${error.message}</p>
        <button class="btn btn-danger mt-2" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Tentar novamente
        </button>
      </div>
    `;
  }
}

function getBadgeColor(tipo) {
  const cores = {
    'Incêndio': 'danger',
    'Acidente': 'warning',
    'Resgate': 'primary',
    'Emergência Médica': 'info',
    'Queda': 'secondary',
    'Afogamento': 'danger',
    'Desabamento': 'dark'
  };
  return cores[tipo] || 'secondary';
}

function getStatusBadgeColor(status) {
  const cores = {
    'Ativa': 'danger',
    'Em andamento': 'warning',
    'Concluída': 'success',
    'Cancelada': 'secondary'
  };
  return cores[status] || 'light';
}

function setupDashboardEventListeners() {
  const verTodasBtn = document.getElementById('verTodasOcorrencias');
  if (verTodasBtn) {
    verTodasBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('tabOcorrencias')?.click();
    });
  }
}

window.app = window.app || {};
window.app.navigateTo = function(tab) {
  const tabButton = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (tabButton) tabButton.click();
};

window.app.atualizarDashboard = async function() {
  const content = document.getElementById('content');
  await showDashboard(content);
  
  mostrarToast('Dashboard atualizado com sucesso!', 'success');
};

window.app.exportarRelatorio = function() {
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const relatorio = {
    data: dataAtual,
    metricas: {
      ocorrenciasHoje: document.querySelectorAll('.display-6')[0]?.textContent,
      ocorrenciasAtivas: document.querySelectorAll('.display-6')[1]?.textContent,
      tempoMedio: document.querySelectorAll('.display-6')[2]?.textContent
    }
  };
  
  const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-chama-sos-${dataAtual.replace(/\//g, '-')}.json`;
  a.click();
  
  mostrarToast('Relatório exportado com sucesso!', 'info');
};

function mostrarToast(mensagem, tipo = 'info') {
  const toastId = 'toast-' + Date.now();
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${tipo === 'success' ? 'bi-check-circle' : tipo === 'danger' ? 'bi-exclamation-circle' : 'bi-info-circle'} me-2"></i>
          ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  toastContainer.innerHTML += toastHTML;
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

if (!document.querySelector('link[href*="bootstrap-icons"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
  document.head.appendChild(link);
}