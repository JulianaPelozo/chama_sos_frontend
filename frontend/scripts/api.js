const API_BASE = 'https://localhost:5500/api'; 
const LOCAL_STORAGE_KEY = 'chama-sos-data';

let cache = {
  ocorrencias: [],
  estatisticas: {},
  lastUpdate: null
};

export async function fetchOcorrencias() {
  try {
    if (navigator.onLine) {
      const response = await fetch(`${API_BASE}/ocorrencias`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        cache.ocorrencias = data;
        cache.lastUpdate = new Date().toISOString();
        saveToLocalStorage();
        
        return data;
      }
    }
    
    const cachedData = await loadFromCache();
    if (cachedData.ocorrencias.length > 0) {
      console.log('Usando dados em cache (offline)');
      return cachedData.ocorrencias;
    }
    
    return getDemoData();
    
  } catch (error) {
    console.error('Erro ao buscar ocorrências:', error);
    
    const cachedData = await loadFromCache();
    if (cachedData.ocorrencias.length > 0) {
      return cachedData.ocorrencias;
    }
    
    return getDemoData();
  }
}

export async function fetchEstatisticas() {
  try {
    if (navigator.onLine) {
      const response = await fetch(`${API_BASE}/estatisticas`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        cache.estatisticas = data;
        saveToLocalStorage();
        return data;
      }
    }
    
    const cachedData = await loadFromCache();
    if (cachedData.estatisticas) {
      return cachedData.estatisticas;
    }
    
    return {
      totalMes: 45,
      mediaDiaria: 15,
      taxaConclusao: 92,
      satisfacao: 4.5
    };
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {};
  }
}

export async function createOcorrencia(ocorrenciaData) {
  try {
    const response = await fetch(`${API_BASE}/ocorrencias`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ocorrenciaData)
    });
    
    if (response.ok) {
      const novaOcorrencia = await response.json();
      
      cache.ocorrencias.unshift(novaOcorrencia);
      saveToLocalStorage();
      
      if (!response.ok && !navigator.onLine) {
        await registerForSync(ocorrenciaData);
        return { 
          success: true, 
          offline: true,
          message: 'Ocorrência salva localmente e será sincronizada quando online',
          data: ocorrenciaData
        };
      }
      
      return { success: true, data: novaOcorrencia };
    }
    
    throw new Error('Erro ao criar ocorrência');
    
  } catch (error) {
    console.error('Erro:', error);
    
    if (!navigator.onLine) {
      await registerForSync(ocorrenciaData);
      return { 
        success: true, 
        offline: true,
        message: 'Ocorrência salva localmente e será sincronizada quando online',
        data: ocorrenciaData
      };
    }
    
    return { 
      success: false, 
      message: 'Erro ao conectar com o servidor' 
    };
  }
}

export async function updateOcorrencia(id, updates) {
  try {
    const response = await fetch(`${API_BASE}/ocorrencias/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (response.ok) {
      const updated = await response.json();
      
      const index = cache.ocorrencias.findIndex(o => o.id === id);
      if (index !== -1) {
        cache.ocorrencias[index] = { ...cache.ocorrencias[index], ...updated };
        saveToLocalStorage();
      }
      
      return { success: true, data: updated };
    }
    
    throw new Error('Erro ao atualizar ocorrência');
    
  } catch (error) {
    console.error('Erro:', error);
    
    if (!navigator.onLine) {
      await savePendingUpdate(id, updates);
      return { 
        success: true, 
        offline: true,
        message: 'Atualização salva localmente'
      };
    }
    
    return { success: false, message: error.message };
  }
}

function getToken() {
  const authData = JSON.parse(localStorage.getItem('chama-sos-auth') || '{}');
  return authData.token || 'demo-token';
}

async function loadFromCache() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erro ao carregar cache:', e);
  }
  return cache;
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Erro ao salvar cache:', e);
  }
}

async function registerForSync(data) {
  try {
    const pending = JSON.parse(localStorage.getItem('pending-requests') || '[]');
    pending.push({
      id: Date.now(),
      type: 'CREATE_OCORRENCIA',
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending-requests', JSON.stringify(pending));
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.sync.register('sync-ocorrencias');
      });
    }
  } catch (error) {
    console.error('Erro ao registrar sync:', error);
  }
}

async function savePendingUpdate(id, updates) {
  try {
    const pending = JSON.parse(localStorage.getItem('pending-updates') || '[]');
    pending.push({ id, updates, timestamp: new Date().toISOString() });
    localStorage.setItem('pending-updates', JSON.stringify(pending));
  } catch (error) {
    console.error('Erro ao salvar atualização pendente:', error);
  }
}

function getDemoData() {
  const tipos = ['Incêndio', 'Acidente', 'Resgate', 'Emergência Médica', 'Queda'];
  const bairros = ['Boa Viagem', 'Casa Forte', 'Pina', 'Boa Vista', 'Santo Amaro', 'Afogados'];
  const status = ['Ativa', 'Em andamento', 'Concluída'];
  const equipes = ['EQ-101', 'EQ-102', 'EQ-103', 'EQ-104'];
  
  const hoje = new Date();
  const data = [];
  
  for (let i = 1; i <= 15; i++) {
    const dataOcorrencia = new Date(hoje);
    dataOcorrencia.setHours(8 + Math.floor(Math.random() * 10));
    dataOcorrencia.setMinutes(Math.floor(Math.random() * 60));
    
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const bairro = bairros[Math.floor(Math.random() * bairros.length)];
    const stat = status[Math.floor(Math.random() * status.length)];
    
    data.push({
      id: `DEMO-${1000 + i}`,
      data: dataOcorrencia.toISOString(),
      tipo,
      bairro,
      endereco: `Rua ${Math.floor(Math.random() * 1000)}, ${bairro}`,
      status: stat,
      prioridade: tipo === 'Incêndio' ? 'Alta' : ['Média', 'Baixa'][Math.floor(Math.random() * 2)],
      equipe: equipes[Math.floor(Math.random() * equipes.length)],
      tempoResposta: stat === 'Concluída' ? `${(Math.random() * 20 + 5).toFixed(1)}min` : null,
      descricao: `Ocorrência de ${tipo.toLowerCase()} no bairro ${bairro}`
    });
  }
  
  return data.sort((a, b) => new Date(b.data) - new Date(a.data));
}

export function checkConnection() {
  return navigator.onLine;
}

export async function syncPendingData() {
  try {
    const pendingRequests = JSON.parse(localStorage.getItem('pending-requests') || '[]');
    const pendingUpdates = JSON.parse(localStorage.getItem('pending-updates') || '[]');
    
    const results = [];
    
    for (const request of pendingRequests) {
      if (request.type === 'CREATE_OCORRENCIA') {
        const result = await createOcorrencia(request.data);
        if (result.success && !result.offline) {
          results.push({ id: request.id, success: true });
        }
      }
    }
    
    for (const update of pendingUpdates) {
      const result = await updateOcorrencia(update.id, update.updates);
      if (result.success && !result.offline) {
        results.push({ id: update.id, success: true });
      }
    }
    
    const successfulIds = results.filter(r => r.success).map(r => r.id);
    
    if (successfulIds.length > 0) {
      const newPendingRequests = pendingRequests.filter(r => !successfulIds.includes(r.id));
      const newPendingUpdates = pendingUpdates.filter(u => !successfulIds.includes(u.id));
      
      localStorage.setItem('pending-requests', JSON.stringify(newPendingRequests));
      localStorage.setItem('pending-updates', JSON.stringify(newPendingUpdates));
    }
    
    return { 
      success: true, 
      synchronized: results.length,
      pending: pendingRequests.length + pendingUpdates.length - results.length
    };
    
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return { success: false, error: error.message };
  }
}