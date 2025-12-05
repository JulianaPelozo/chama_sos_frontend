import { createOcorrencia } from './api.js';
import { getUsuarioAtual } from './auth.js';

export async function showNovaOcorrencia(content) {
  const usuario = getUsuarioAtual();
  
  content.innerHTML = `
    <div class="row fade-in">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-header bg-danger text-white">
            <h4 class="mb-0">
              <i class="bi bi-plus-circle me-2"></i>
              Nova Ocorrência
            </h4>
            <p class="mb-0 small opacity-75">Preencha os dados da emergência</p>
          </div>
          
          <div class="card-body">
            <form id="formNovaOcorrencia">
              <div class="row g-3">
                <!-- Tipo de Emergência -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="bi bi-exclamation-triangle text-danger me-1"></i>
                    Tipo de Emergência *
                  </label>
                  <select class="form-select" id="tipo" required>
                    <option value="">Selecione o tipo...</option>
                    <option value="Incêndio">🔥 Incêndio</option>
                    <option value="Acidente">🚗 Acidente de Trânsito</option>
                    <option value="Resgate">🆘 Resgate</option>
                    <option value="Emergência Médica">🏥 Emergência Médica</option>
                    <option value="Queda">⚠️ Queda/Trauma</option>
                    <option value="Afogamento">🌊 Afogamento</option>
                    <option value="Desabamento">🏚️ Desabamento</option>
                    <option value="Vazamento">💧 Vazamento de Gás</option>
                    <option value="Animal">🐕 Animal Perigoso</option>
                    <option value="Outro">❓ Outro</option>
                  </select>
                </div>
                
                <!-- Prioridade -->
                <div class="col-md-6">
                  <label class="form-label fw-bold">
                    <i class="bi bi-flag text-danger me-1"></i>
                    Prioridade *
                  </label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="prioridade" id="alta" value="Alta" required>
                    <label class="btn btn-outline-danger" for="alta">
                      <i class="bi bi-exclamation-circle"></i> Alta
                    </label>
                    
                    <input type="radio" class="btn-check" name="prioridade" id="media" value="Média">
                    <label class="btn btn-outline-warning" for="media">
                      <i class="bi bi-exclamation-triangle"></i> Média
                    </label>
                    
                    <input type="radio" class="btn-check" name="prioridade" id="baixa" value="Baixa">
                    <label class="btn btn-outline-info" for="baixa">
                      <i class="bi bi-info-circle"></i> Baixa
                    </label>
                  </div>
                </div>
                
                <!-- Localização -->
                <div class="col-12">
                  <div class="card mb-3">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">
                        <i class="bi bi-geo-alt text-danger me-1"></i>
                        Localização
                      </h6>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label">Bairro *</label>
                          <input type="text" class="form-control" id="bairro" required 
                                 placeholder="Ex: Boa Viagem">
                        </div>
                        
                        <div class="col-md-6">
                          <label class="form-label">Rua/Avenida *</label>
                          <input type="text" class="form-control" id="endereco" required 
                                 placeholder="Ex: Av. Boa Viagem">
                        </div>
                        
                        <div class="col-md-4">
                          <label class="form-label">Número</label>
                          <input type="text" class="form-control" id="numero" 
                                 placeholder="Ex: 123">
                        </div>
                        
                        <div class="col-md-4">
                          <label class="form-label">Complemento</label>
                          <input type="text" class="form-control" id="complemento" 
                                 placeholder="Ex: Apartamento 101">
                        </div>
                        
                        <div class="col-md-4">
                          <label class="form-label">Ponto de Referência</label>
                          <input type="text" class="form-control" id="referencia" 
                                 placeholder="Ex: Próximo ao shopping">
                        </div>
                        
                        <div class="col-12">
                          <button type="button" class="btn btn-outline-primary btn-sm" id="btnGeolocalizacao">
                            <i class="bi bi-geo"></i> Usar minha localização atual
                          </button>
                          <small class="text-muted ms-2">Clique para obter coordenadas GPS</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Descrição -->
                <div class="col-12">
                  <label class="form-label fw-bold">
                    <i class="bi bi-card-text text-danger me-1"></i>
                    Descrição da Emergência *
                  </label>
                  <textarea class="form-control" id="descricao" rows="4" required 
                            placeholder="Descreva detalhadamente a situação, número de vítimas, riscos envolvidos..."></textarea>
                  <div class="form-text">
                    Inclua informações como: número aproximado de vítimas, idade, gravidade, riscos (fogo, fumaça, desabamento), acesso ao local.
                  </div>
                </div>
                
                <!-- Informações Adicionais -->
                <div class="col-md-6">
                  <label class="form-label">
                    <i class="bi bi-telephone text-danger me-1"></i>
                    Telefone de Contato
                  </label>
                  <input type="tel" class="form-control" id="telefone" 
                         placeholder="(81) 9XXXX-XXXX">
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">
                    <i class="bi bi-person text-danger me-1"></i>
                    Nome do Solicitante
                  </label>
                  <input type="text" class="form-control" id="solicitante" 
                         placeholder="Nome da pessoa que reportou">
                </div>
                
                <!-- Equipe Designada -->
                <div class="col-12">
                  <div class="card">
                    <div class="card-header bg-light">
                      <h6 class="mb-0">
                        <i class="bi bi-people text-danger me-1"></i>
                        Designação de Equipe
                      </h6>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-md-6">
                          <label class="form-label">Equipe Responsável</label>
                          <select class="form-select" id="equipe">
                            <option value="">Selecionar equipe...</option>
                            <option value="EQ-101">EQ-101 - Unidade Central</option>
                            <option value="EQ-102">EQ-102 - Suporte Rápido</option>
                            <option value="EQ-103">EQ-103 - Resgate Técnico</option>
                            <option value="EQ-104">EQ-104 - Combate a Incêndio</option>
                          </select>
                        </div>
                        
                        <div class="col-md-6">
                          <label class="form-label">Viatura</label>
                          <select class="form-select" id="viatura">
                            <option value="">Selecionar viatura...</option>
                            <option value="VTR-01">VTR-01 - Auto Bomba Tanque</option>
                            <option value="VTR-02">VTR-02 - Auto Bomba Resgate</option>
                            <option value="VTR-03">VTR-03 - Auto Escada</option>
                            <option value="SAMU-01">SAMU-01 - Suporte Avançado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Observações -->
                <div class="col-12">
                  <label class="form-label">
                    <i class="bi bi-chat-text text-danger me-1"></i>
                    Observações Adicionais
                  </label>
                  <textarea class="form-control" id="observacoes" rows="2" 
                            placeholder="Informações complementares, restrições de acesso, condições climáticas..."></textarea>
                </div>
                
                <!-- Botões de Ação -->
                <div class="col-12">
                  <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-secondary" onclick="app.navigateTo('dashboard')">
                      <i class="bi bi-arrow-left me-1"></i> Cancelar
                    </button>
                    
                    <div>
                      <button type="button" class="btn btn-outline-danger me-2" id="btnSalvarRascunho">
                        <i class="bi bi-save me-1"></i> Salvar Rascunho
                      </button>
                      
                      <button type="submit" class="btn btn-danger" id="btnRegistrar">
                        <i class="bi bi-send me-1"></i> Registrar Ocorrência
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Modal de confirmação -->
        <div class="modal fade" id="confirmModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header bg-success text-white">
                <h5 class="modal-title">
                  <i class="bi bi-check-circle me-2"></i>
                  Ocorrência Registrada!
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div id="modalMessage"></div>
                <div class="alert alert-info mt-3" id="offlineMessage" style="display: none;">
                  <i class="bi bi-wifi-off me-2"></i>
                  <strong>Modo Offline:</strong> A ocorrência foi salva localmente e será sincronizada automaticamente quando a conexão for restabelecida.
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  <i class="bi bi-plus-circle me-1"></i> Nova Ocorrência
                </button>
                <button type="button" class="btn btn-primary" onclick="app.navigateTo('ocorrencias')">
                  <i class="bi bi-list-ul me-1"></i> Ver Todas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  setupFormEventListeners();
}

function setupFormEventListeners() {
  const form = document.getElementById('formNovaOcorrencia');
  const btnGeolocalizacao = document.getElementById('btnGeolocalizacao');
  const btnSalvarRascunho = document.getElementById('btnSalvarRascunho');
  const btnRegistrar = document.getElementById('btnRegistrar');
  
  if (btnGeolocalizacao) {
    btnGeolocalizacao.addEventListener('click', obterGeolocalizacao);
  }
  
  if (btnSalvarRascunho) {
    btnSalvarRascunho.addEventListener('click', salvarRascunho);
  }
  
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  const tipoSelect = document.getElementById('tipo');
  if (tipoSelect) {
    tipoSelect.addEventListener('change', function() {
      autoPreencherPorTipo(this.value);
    });
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  
  const btnRegistrar = document.getElementById('btnRegistrar');
  const originalText = btnRegistrar.innerHTML;
  
  try {
    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Registrando...';
    
    const dados = coletarDadosFormulario();
    
    const validacao = validarDados(dados);
    if (!validacao.valido) {
      mostrarErro(validacao.mensagem);
      btnRegistrar.disabled = false;
      btnRegistrar.innerHTML = originalText;
      return;
    }
    
    const resultado = await createOcorrencia(dados);
    
    if (resultado.success) {
      mostrarSucesso(resultado);
      limparFormulario();
    } else {
      mostrarErro(resultado.message || 'Erro ao registrar ocorrência');
    }
    
  } catch (error) {
    console.error('Erro:', error);
    mostrarErro('Erro inesperado. Tente novamente.');
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.innerHTML = originalText;
  }
}

function coletarDadosFormulario() {
  const usuario = getUsuarioAtual();
  
  return {
    id: `TEMP-${Date.now()}`,
    data: new Date().toISOString(),
    tipo: document.getElementById('tipo').value,
    prioridade: document.querySelector('input[name="prioridade"]:checked')?.value || 'Média',
    bairro: document.getElementById('bairro').value,
    endereco: document.getElementById('endereco').value,
    numero: document.getElementById('numero').value,
    complemento: document.getElementById('complemento').value,
    referencia: document.getElementById('referencia').value,
    descricao: document.getElementById('descricao').value,
    telefone: document.getElementById('telefone').value,
    solicitante: document.getElementById('solicitante').value,
    equipe: document.getElementById('equipe').value,
    viatura: document.getElementById('viatura').value,
    observacoes: document.getElementById('observacoes').value,
    status: 'Ativa',
    registradoPor: usuario?.matricula || 'Sistema',
    registradoPorNome: usuario?.nome || 'Operador'
  };
}

function validarDados(dados) {
  const camposObrigatorios = ['tipo', 'prioridade', 'bairro', 'endereco', 'descricao'];
  
  for (const campo of camposObrigatorios) {
    if (!dados[campo]) {
      return {
        valido: false,
        mensagem: `O campo "${campo}" é obrigatório`
      };
    }
  }
  
  if (dados.descricao.length < 10) {
    return {
      valido: false,
      mensagem: 'A descrição deve ter pelo menos 10 caracteres'
    };
  }
  
  return { valido: true };
}

async function obterGeolocalizacao() {
  const btn = document.getElementById('btnGeolocalizacao');
  const originalText = btn.innerHTML;
  
  try {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Obtendo localização...';
    
    if (!navigator.geolocation) {
      throw new Error('Geolocalização não suportada pelo navegador');
    }
    
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
    
    const { latitude, longitude } = position.coords;
    
    document.getElementById('referencia').value = 
      `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    
    mostrarToast('Localização obtida com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao obter localização:', error);
    mostrarErro('Não foi possível obter a localização. Preencha manualmente.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function salvarRascunho() {
  const dados = coletarDadosFormulario();
  
  try {
    const rascunhos = JSON.parse(localStorage.getItem('rascunhos-ocorrencias') || '[]');
    rascunhos.push({
      ...dados,
      id: `RASCUNHO-${Date.now()}`,
      dataSalvamento: new Date().toISOString()
    });
    
    localStorage.setItem('rascunhos-ocorrencias', JSON.stringify(rascunhos));
    
    mostrarToast('Rascunho salvo com sucesso!', 'info');
  } catch (error) {
    console.error('Erro ao salvar rascunho:', error);
    mostrarErro('Erro ao salvar rascunho');
  }
}

function autoPreencherPorTipo(tipo) {
  const prioridadeAlta = document.getElementById('alta');
  const descricao = document.getElementById('descricao');
  
  if (!prioridadeAlta || !descricao) return;
  
  if (tipo === 'Incêndio' || tipo === 'Desabamento' || tipo === 'Afogamento') {
    prioridadeAlta.checked = true;
  }
  
  const sugestoes = {
    'Incêndio': 'Local: \nTipo de edificação: \nPessoas no local: \nFocos de incêndio: \nMateriais envolvidos: \nAcesso para viaturas: ',
    'Acidente': 'Tipo de acidente: \nNúmero de veículos: \nVítimas presas nas ferragens: \nVazamento de combustível: \nSinalização do local: ',
    'Resgate': 'Tipo de resgate necessário: \nLocal de difícil acesso: \nEquipamentos necessários: \nCondições climáticas: \nRiscos envolvidos: ',
    'Emergência Médica': 'Número de vítimas: \nIdades aproximadas: \nSintomas/Estado das vítimas: \nPrimeiros socorros aplicados: \nHistórico médico conhecido: ',
    'Queda': 'Altura da queda: \nSuperfície de impacto: \nEstado da vítima: \nMovimentação possível: \nAcesso ao local: ',
    'Afogamento': 'Tipo de corpo d\'água: \nCorrenteza presente: \nVisibilidade da água: \nTempo submerso: \nEquipamentos disponíveis: ',
    'Desabamento': 'Tipo de estrutura: \nExtensão do desabamento: \nVítimas soterradas: \nRisco de novos desabamentos: \nAcesso para equipamentos: '
  };
  
  if (sugestoes[tipo] && !descricao.value) {
    descricao.value = sugestoes[tipo];
  }
}

function mostrarSucesso(resultado) {
  const modalMessage = document.getElementById('modalMessage');
  const offlineMessage = document.getElementById('offlineMessage');
  const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
  
  if (resultado.offline) {
    modalMessage.innerHTML = `
      <div class="alert alert-success">
        <h5><i class="bi bi-check-circle me-2"></i>Ocorrência registrada localmente</h5>
        <p>Protocolo: <strong>${resultado.data.id}</strong></p>
        <p>${resultado.message}</p>
      </div>
    `;
    offlineMessage.style.display = 'block';
  } else {
    modalMessage.innerHTML = `
      <div class="alert alert-success">
        <h5><i class="bi bi-check-circle me-2"></i>Ocorrência registrada com sucesso!</h5>
        <p>Protocolo: <strong>${resultado.data.id}</strong></p>
        <p>Tipo: <strong>${resultado.data.tipo}</strong></p>
        <p>Local: <strong>${resultado.data.bairro}</strong></p>
        <p>Status: <span class="badge bg-danger">Ativa</span></p>
      </div>
    `;
    offlineMessage.style.display = 'none';
  }
  
  modal.show();
}

function mostrarErro(mensagem) {
  const toastHTML = `
    <div class="toast align-items-center text-bg-danger border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi bi-exclamation-triangle me-2"></i>
          ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  mostrarToastElement(toastHTML);
}

function mostrarToast(mensagem, tipo = 'info') {
  const icon = tipo === 'success' ? 'bi-check-circle' : 
               tipo === 'danger' ? 'bi-exclamation-triangle' : 'bi-info-circle';
  
  const toastHTML = `
    <div class="toast align-items-center text-bg-${tipo} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">
          <i class="bi ${icon} me-2"></i>
          ${mensagem}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  mostrarToastElement(toastHTML);
}

function mostrarToastElement(html) {
  const container = document.querySelector('.toast-container') || 
                   (() => {
                     const div = document.createElement('div');
                     div.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                     document.body.appendChild(div);
                     return div;
                   })();
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const toastElement = tempDiv.firstElementChild;
  
  container.appendChild(toastElement);
  
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

function limparFormulario() {
  const form = document.getElementById('formNovaOcorrencia');
  if (form) {
    form.reset();
  }
}

if (!document.querySelector('link[href*="bootstrap-icons"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
  document.head.appendChild(link);
}