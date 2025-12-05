const AUTH_KEY = 'chama-sos-auth';
const TOKEN_KEY = 'chama-sos-token';

export async function verificarAutenticacao() {
  if (window.location.pathname.includes('login.html')) {
    return false;
  }
  
  const authData = getAuthData();
  
  if (!authData || !authData.token) {
    return false;
  }
  
  const tokenValido = await validarToken(authData.token);
  
  if (!tokenValido) {
    limparAuth();
    return false;
  }
  
  return true;
}

export async function fazerLogin(matricula, senha) {
  try {
    const response = await mockApiLogin(matricula, senha);
    
    if (response.success) {
      const authData = {
        token: response.token,
        usuario: response.usuario,
        expiracao: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 horas
      };
      
      salvarAuthData(authData);
      return { success: true };
    } else {
      return { success: false, message: response.message };
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      success: false, 
      message: 'Erro de conexão. Tentando modo offline...',
      offline: true 
    };
  }
}

export function fazerLogout() {
  limparAuth();
  window.location.href = 'login.html';
}

async function mockApiLogin(matricula, senha) {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const usuariosDemo = {
    '12345': { 
      senha: '12345', 
      usuario: { 
        matricula: '12345', 
        nome: 'Bombeiro Silva', 
        posto: 'Sargento',
        turno: '07:00 - 19:00',
        regiao: 'Região Metropolitana do Recife'
      }
    },
    '67890': { 
      senha: '67890', 
      usuario: { 
        matricula: '67890', 
        nome: 'Bombeiro Santos', 
        posto: 'Cabo',
        turno: '19:00 - 07:00',
        regiao: 'Região Metropolitana do Recife'
      }
    }
  };
  
  const usuario = usuariosDemo[matricula];
  
  if (usuario && usuario.senha === senha) {
    return {
      success: true,
      token: `demo-token-${matricula}-${Date.now()}`,
      usuario: usuario.usuario
    };
  }
  
  return {
    success: false,
    message: 'Matrícula ou senha incorretos'
  };
}

async function validarToken(token) {
  return token && token.startsWith('demo-token-');
}

function salvarAuthData(authData) {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  } catch (e) {
    console.warn('LocalStorage não disponível, usando sessionStorage');
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  }
}

function getAuthData() {
  try {
    const data = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function limparAuth() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
}

export function getUsuarioAtual() {
  const authData = getAuthData();
  return authData ? authData.usuario : null;
}

export function isOfflineMode() {
  return !navigator.onLine;
}

export function setupOfflineSync() {
  window.addEventListener('online', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-auth');
      });
    }
  });
}