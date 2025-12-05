import { fetchOcorrencias, updateOcorrencia } from './api.js';
import { getUsuarioAtual } from './auth.js';

export async function showOcorrencias(content) {
  try {
    content.innerHTML = '<div class="spinner-overlay"><div class="spinner"></div></div>';
    
    const data = await fetchOcorrencias();
    const usuario = getUsuarioAtual();
    
    content.innerHTML = `
      <div class="row fade-in">
        <div class="col-12">
          <div class="card shadow mb-4">
            <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <div>
                <h4 class="mb-0">
                  <i class="bi bi-list-task me-2"></i>
                  Ocorrências
                </h4>
                <p class="mb-0 small opacity-75">Total: ${data.length} ocorrências</p>
              </div>
              <div class="d-flex">
                <button class="btn btn-light btn-sm me-2" id="btnFiltrar">
                  <i class="bi bi-funnel"></i> Filtrar
                </button>
                <button class="btn btn-light btn-sm" id="btnExportar">
                  <i class="bi bi-download"></i> Exportar
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <!-- Filtros -->
              <div class="row mb-4" id="filtrosContainer" style="display: none;">
                <div class="col-md-3 mb-2">
                  <label class="form-label small">Status</label>
                  <select class="form-select form-select-sm" id="filtroStatus">
                    <option value="">Todos</option>
                    <option value="Ativa">Ativa</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
                <div class="col-md-3 mb-2">
                  <label class="form-label small">Prioridade</label>
                  <select class="form-select form-select-sm" id="filtroPrioridade">
                    <option value="">Todas</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
                <div class="col-md-3 mb-2">
                  <label class="form-label small">Tipo</label>
                  <select class="form-select form-select-sm" id="filtroTipo">
                    <option value="">Todos</option>
                    <option value="Incêndio">Incêndio</option>
                    <option value="Acidente">Acidente</option>
                    <option value="Resgate">Resgate</option>
                    <option value="Emergência Médica">Emergência Médica</option>
                    <option value="Queda">Queda</option>
                  </select>
                </div>
                <div class="col-md-3 mb-2 d-flex align-items-end">
                  <button class="btn btn-danger btn-sm w-100" id="btnAplicarFiltros">
                    <i class="bi bi-check-lg"></i> Aplicar
                  </button>
                </div>
              </div>
              
              <!-- Lista de ocorrências -->
              <div class="table-responsive">
                <table class="table table-hover" id="tabelaOcorrencias">
                  <thead class="table-light">
                    <tr>
                      <th width="120">Data/Hora</th>
                      <th width="100">Tipo</th>
                      <th>Local</th>
                      <th width="100">Status</th>
                      <th width="120">Equipe</th>
                      <th width="120">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="tbodyOcorrencias">
                    ${renderOcorrencias(data)}
                  </tbody>
                </table>
              </div>
              
              <!-- Paginação -->
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="small text-muted">
                  Mostrando <span id="contagemVisiveis">${data.length}</span> de ${data.length} ocorrências
                </div>
                <div class="btn-group">
                  <button class="btn btn-outline-secondary btn-sm" id="btnAnterior" disabled>
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" id="btnProxima" ${data.length > 10 ? '' : 'disabled'}>
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal de detalhes -->
      <div class="modal fade" id="detalhesModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-info-circle me-2"></i>
                Detalhes da Ocorrência
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="detalhesConteudo">
              <!-- Conteúdo carregado via JavaScript -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    setupOcorrenciasEventListeners(data);
    
  } catch (error) {
    console.error('Erro ao carregar ocorrências:', error);
    content.innerHTML = `
      <div class="alert alert-danger">
        <h5><i class="bi bi-exclamation-triangle me-2"></i>Erro ao carregar ocorrências</h5>
        <p>${error.message}</p>
        <button class="btn btn-danger mt-2" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Tentar novamente
        </button>
      </div>
    `;
  }
}

function renderOcorrencias(ocorrencias) {
  return ocorrencias.map(ocorrencia => `
    <tr class="${ocorrencia.prioridade === 'Alta' ? 'table-danger' : ''}" data-id="${ocorrencia.id}">
      <td>
        <div class="small text-muted">
          ${new Date(ocorrencia.data).toLocaleDateString('pt-BR')}
        </div>
        <div class="small">
          ${new Date(ocorrencia.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
        </div>
      </td>
      <td>
        <span class="badge ${getBadgeColor(ocorrencia.tipo)}">
          ${getTipoIcon(ocorrencia.tipo)} ${ocorrencia.tipo}
        </span>
      </td>
      <td>
        <div class="fw-bold">${ocorrencia.bairro}</div>
        <div class="small text-muted">${ocorrencia.endereco || ''}</div>
        ${ocorrencia.referencia ? `<div class="small text-muted"><i class="bi bi-geo"></i> ${ocorrencia.referencia}</div>` : ''}
      </td>
      <td>
        <span class="badge ${getStatusBadgeColor(ocorrencia.status)}">
          ${ocorrencia.status}
        </span>
        ${ocorrencia.tempoResposta ? `<div class="small text-muted">${ocorrencia.tempoResposta}</div>` : ''}
      </td>
      <td>
        ${ocorrencia.equipe ? `
          <div class="small">${ocorrencia.equipe}</div>
          ${ocorrencia.viatura ? `<div class="small text-muted">${ocorrencia.viatura}</div>` : ''}
        ` : '<span class="badge bg-secondary">A designar</span>'}
      </td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button class="btn btn-outline-primary" onclick="verDetalhes('${ocorrencia.id}')" title="Detalhes">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-outline-warning" onclick="editarStatus('${ocorrencia.id}')" title="Alterar Status">
            <i class="bi bi-pencil"></i>
          </button>
          ${ocorrencia.status === 'Ativa' ? `
            <button class="btn btn-outline-success" onclick="assumirOcorrencia('${ocorrencia.id}')" title="Assumir">
              <i class="bi bi-check-lg"></i>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function setupOcorrenciasEventListeners(ocorrencias) {
  // Toggle filtros
  document.getElementById('btnFiltrar')?.addEventListener('click', () => {
    const filtrosContainer = document.getElementById('filtrosContainer');
    if (filtrosContainer) {
      filtrosContainer.style.display = filtrosContainer.style.display === 'none' ? 'flex' : 'none';
    }
  });
  
  // Aplicar filtros
  document.getElementById('btnAplicarFiltros')?.addEventListener('click', aplicarFiltros);
  
  // Exportar
  document.getElementById('btnExportar')?.addEventListener('click', exportarOcorrencias);
  
  // Paginação
  let paginaAtual = 1;
  const itensPorPagina = 10;
  
  document.getElementById('btnProxima')?.addEventListener('click', () => {
    paginaAtual++;
    atualizarPagina(ocorrencias, paginaAtual, itensPorPagina);
  });
  
  document.getElementById('btnAnterior')?.addEventListener('click', () => {
    paginaAtual--;
    atualizarPagina(ocorrencias, paginaAtual, itensPorPagina);
  });
  
  // Inicializar paginação
  atualizarPagina(ocorrencias, paginaAtual, itensPorPagina);
}

function aplicarFiltros() {
  const filtroStatus = document.getElementById('filtroStatus').value;
  const filtroPrioridade = document.getElementById('filtroPrioridade').value;
  const filtroTipo = document.getElementById('filtroTipo').value;
  
  const linhas = document.querySelectorAll('#tbodyOcorrencias tr');
  let visiveis = 0;
  
  linhas.forEach(linha => {
    const status = linha.querySelector('.badge')?.textContent.trim();
    const prioridade = linha.closest('tr').classList.contains('table-danger') ? 'Alta' : 'Média/Baixa';
    const tipo = linha.querySelector('.badge')?.textContent.replace(/[🔥🚗🆘🏥⚠️🌊🏚️💧🐕❓]/g, '').trim();
    
    let mostrar = true;
    
    if (filtroStatus && status !== filtroStatus) mostrar = false;
    if (filtroPrioridade === 'Alta' && prioridade !== 'Alta') mostrar = false;
    if (filtroPrioridade === 'Média/Baixa' && prioridade === 'Alta') mostrar = false;
    if (filtroTipo && tipo !== filtroTipo) mostrar = false;
    
    linha.style.display = mostrar ? '' : 'none';
    if (mostrar) visiveis++;
  });
  
  document.getElementById('contagemVisiveis').textContent = visiveis;
}

function exportarOcorrencias() {
  const dados = [];
  const linhas = document.querySelectorAll('#tbodyOcorrencias tr:not([style*="none"])');
  
  linhas.forEach(linha => {
    const colunas = linha.querySelectorAll('td');
    dados.push({
      data: colunas[0].textContent.trim(),
      tipo: colunas[1].textContent.replace(/[🔥🚗🆘🏥⚠️🌊🏚️💧🐕❓]/g, '').trim(),
      local: colunas[2].textContent.trim(),
      status: colunas[3].textContent.trim(),
      equipe: colunas[4].textContent.trim()
    });
  });
  
  const csv = convertToCSV(dados);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ocorrencias-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  mostrarToast('Dados exportados com sucesso!', 'success');
}

function convertToCSV(dados) {
  const cabecalhos = ['Data/Hora', 'Tipo', 'Local', 'Status', 'Equipe'];
  const linhas = dados.map(obj => 
    cabecalhos.map(header => 
      `"${obj[header.toLowerCase().replace('/', '')] || ''}"`
    ).join(',')
  );
  
  return [cabecalhos.join(','), ...linhas].join('\n');
}

function atualizarPagina(ocorrencias, pagina, itensPorPagina) {
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const ocorrenciasPagina = ocorrencias.slice(inicio, fim);
  
  document.getElementById('tbodyOcorrencias').innerHTML = renderOcorrencias(ocorrenciasPagina);
  document.getElementById('contagemVisiveis').textContent = ocorrenciasPagina.length;
  
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProxima = document.getElementById('btnProxima');
  
  btnAnterior.disabled = pagina <= 1;
  btnProxima.disabled = fim >= ocorrencias.length;
}

// Funções globais para ações
window.verDetalhes = async function(id) {
  try {
    const ocorrencias = await fetchOcorrencias();
    const ocorrencia = ocorrencias.find(o => o.id === id);
    
    if (!ocorrencia) {
      mostrarToast('Ocorrência não encontrada', 'danger');
      return;
    }
    
    const modalContent = document.getElementById('detalhesConteudo');
    modalContent.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header bg-light">
              <h6 class="mb-0">Informações Gerais</h6>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-4">Protocolo:</dt>
                <dd class="col-sm-8"><code>${ocorrencia.id}</code></dd>
                
                <dt class="col-sm-4">Data/Hora:</dt>
                <dd class="col-sm-8">${new Date(ocorrencia.data).toLocaleString('pt-BR')}</dd>
                
                <dt class="col-sm-4">Tipo:</dt>
                <dd class="col-sm-8">
                  <span class="badge ${getBadgeColor(ocorrencia.tipo)}">
                    ${ocorrencia.tipo}
                  </span>
                </dd>
                
                <dt class="col-sm-4">Prioridade:</dt>
                <dd class="col-sm-8">
                  <span class="badge ${ocorrencia.prioridade === 'Alta' ? 'bg-danger' : 'bg-warning'}">
                    ${ocorrencia.prioridade}
                  </span>
                </dd>
                
                <dt class="col-sm-4">Status:</dt>
                <dd class="col-sm-8">
                  <span class="badge ${getStatusBadgeColor(ocorrencia.status)}">
                    ${ocorrencia.status}
                  </span>
                </dd>
                
                ${ocorrencia.registradoPor ? `
                  <dt class="col-sm-4">Registrado por:</dt>
                  <dd class="col-sm-8">${ocorrencia.registradoPorNome} (${ocorrencia.registradoPor})</dd>
                ` : ''}
              </dl>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header bg-light">
              <h6 class="mb-0">Localização</h6>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-4">Bairro:</dt>
                <dd class="col-sm-8">${ocorrencia.bairro}</dd>
                
                <dt class="col-sm-4">Endereço:</dt>
                <dd class="col-sm-8">${ocorrencia.endereco || 'Não informado'}</dd>
                
                ${ocorrencia.numero ? `
                  <dt class="col-sm-4">Número:</dt>
                  <dd class="col-sm-8">${ocorrencia.numero}</dd>
                ` : ''}
                
                ${ocorrencia.complemento ? `
                  <dt class="col-sm-4">Complemento:</dt>
                  <dd class="col-sm-8">${ocorrencia.complemento}</dd>
                ` : ''}
                
                ${ocorrencia.referencia ? `
                  <dt class="col-sm-4">Referência:</dt>
                  <dd class="col-sm-8">${ocorrencia.referencia}</dd>
                ` : ''}
                
                ${ocorrencia.telefone ? `
                  <dt class="col-sm-4">Telefone:</dt>
                  <dd class="col-sm-8">${ocorrencia.telefone}</dd>
                ` : ''}
              </dl>
            </div>
          </div>
        </div>
        
        <div class="col-12">
          <div class="card mb-3">
            <div class="card-header bg-light">
              <h6 class="mb-0">Descrição</h6>
            </div>
            <div class="card-body">
              <p>${ocorrencia.descricao || 'Sem descrição'}</p>
              
              ${ocorrencia.observacoes ? `
                <div class="mt-3">
                  <strong>Observações:</strong>
                  <p class="mb-0">${ocorrencia.observacoes}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">Recursos Designados</h6>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-4">Equipe:</dt>
                <dd class="col-sm-8">${ocorrencia.equipe || 'A designar'}</dd>
                
                ${ocorrencia.viatura ? `
                  <dt class="col-sm-4">Viatura:</dt>
                  <dd class="col-sm-8">${ocorrencia.viatura}</dd>
                ` : ''}
                
                ${ocorrencia.tempoResposta ? `
                  <dt class="col-sm-4">Tempo resposta:</dt>
                  <dd class="col-sm-8">${ocorrencia.tempoResposta}</dd>
                ` : ''}
              </dl>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-light">
              <h6 class="mb-0">Ações</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                ${ocorrencia.status === 'Ativa' ? `
                  <button class="btn btn-danger" onclick="atualizarStatusOcorrencia('${ocorrencia.id}', 'Em andamento')">
                    <i class="bi bi-play-circle me-2"></i>Iniciar Atendimento
                  </button>
                ` : ''}
                
                ${ocorrencia.status === 'Em andamento' ? `
                  <button class="btn btn-success" onclick="atualizarStatusOcorrencia('${ocorrencia.id}', 'Concluída')">
                    <i class="bi bi-check-circle me-2"></i>Concluir Atendimento
                  </button>
                ` : ''}
                
                <button class="btn btn-outline-secondary" onclick="imprimirOcorrencia('${ocorrencia.id}')">
                  <i class="bi bi-printer me-2"></i>Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('detalhesModal'));
    modal.show();
    
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    mostrarToast('Erro ao carregar detalhes da ocorrência', 'danger');
  }
};

window.editarStatus = function(id) {
  const novoStatus = prompt('Novo status (Ativa, Em andamento, Concluída, Cancelada):');
  if (novoStatus && ['Ativa', 'Em andamento', 'Concluída', 'Cancelada'].includes(novoStatus)) {
    atualizarStatusOcorrencia(id, novoStatus);
  }
};

window.assumirOcorrencia = async function(id) {
  const usuario = getUsuarioAtual();
  if (!usuario) return;
  
  const confirmacao = confirm(`Deseja assumir esta ocorrência?`);
  if (!confirmacao) return;
  
  try {
    const resultado = await updateOcorrencia(id, {
      equipe: usuario.matricula,
      status: 'Em andamento'
    });
    
    if (resultado.success) {
      mostrarToast('Ocorrência assumida com sucesso!', 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      mostrarToast(resultado.message || 'Erro ao assumir ocorrência', 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarToast('Erro ao assumir ocorrência', 'danger');
  }
};

async function atualizarStatusOcorrencia(id, novoStatus) {
  try {
    const resultado = await updateOcorrencia(id, { 
      status: novoStatus,
      dataAtualizacao: new Date().toISOString()
    });
    
    if (resultado.success) {
      mostrarToast(`Status atualizado para: ${novoStatus}`, 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      mostrarToast(resultado.message || 'Erro ao atualizar status', 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarToast('Erro ao atualizar status', 'danger');
  }
}

function imprimirOcorrencia(id) {
  const conteudo = document.getElementById('detalhesConteudo').innerHTML;
  const janela = window.open('', '_blank');
  janela.document.write(`
    <html>
      <head>
        <title>CHAMA SOS - Ocorrência ${id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #B71C1C; }
          .badge { padding: 5px 10px; border-radius: 4px; color: white; }
          .badge-danger { background: #B71C1C; }
          .badge-warning { background: #F57C00; }
          .badge-success { background: #2E7D32; }
          .badge-secondary { background: #6c757d; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .mt-3 { margin-top: 15px; }
        </style>
      </head>
      <body>
        <h1>CHAMA SOS - Corpo de Bombeiros</h1>
        <h2>Relatório de Ocorrência</h2>
        <div>${conteudo}</div>
        <div class="mt-3">
          <hr>
          <p><small>Emitido em: ${new Date().toLocaleString('pt-BR')}</small></p>
        </div>
      </body>
    </html>
  `);
  janela.document.close();
  janela.print();
}

// Funções auxiliares
function getBadgeColor(tipo) {
  const cores = {
    'Incêndio': 'bg-danger',
    'Acidente': 'bg-warning',
    'Resgate': 'bg-primary',
    'Emergência Médica': 'bg-info',
    'Queda': 'bg-secondary',
    'Afogamento': 'bg-danger',
    'Desabamento': 'bg-dark',
    'Vazamento': 'bg-success',
    'Animal': 'bg-success',
    'Outro': 'bg-secondary'
  };
  return cores[tipo] || 'bg-secondary';
}

function getTipoIcon(tipo) {
  const icones = {
    'Incêndio': '🔥',
    'Acidente': '🚗',
    'Resgate': '🆘',
    'Emergência Médica': '🏥',
    'Queda': '⚠️',
    'Afogamento': '🌊',
    'Desabamento': '🏚️',
    'Vazamento': '💧',
    'Animal': '🐕',
    'Outro': '❓'
  };
  return icones[tipo] || '📝';
}

function getStatusBadgeColor(status) {
  const cores = {
    'Ativa': 'bg-danger',
    'Em andamento': 'bg-warning',
    'Concluída': 'bg-success',
    'Cancelada': 'bg-secondary'
  };
  return cores[status] || 'bg-light text-dark';
}

function mostrarToast(mensagem, tipo = 'info') {
  const toastHTML = `
    <div class="toast align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${tipo === 'success' ? 'bi-check-circle' : tipo === 'danger' ? 'bi-exclamation-triangle' : 'bi-info-circle'} me-2"></i>
          ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  const container = document.querySelector('.toast-container') || 
                   (() => {
                     const div = document.createElement('div');
                     div.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                     document.body.appendChild(div);
                     return div;
                   })();
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = toastHTML;
  const toastElement = tempDiv.firstElementChild;
  
  container.appendChild(toastElement);
  
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}