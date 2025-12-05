import { fazerLogin } from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
  const matriculaInput = document.getElementById('matricula');
  const senhaInput = document.getElementById('senha');
  const btnLogin = document.getElementById('btnLogin');
  const btnDemo = document.getElementById('btnDemo');
  const erroDiv = document.getElementById('erro');
  
  verificarLoginExistente();
  
  matriculaInput.focus();
  
  btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const matricula = matriculaInput.value.trim();
    const senha = senhaInput.value.trim();
    
    if (!matricula || !senha) {
      mostrarErro('Por favor, preencha matrícula e senha');
      return;
    }
    
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
    
    try {
      const resultado = await fazerLogin(matricula, senha);
      
      if (resultado.success) {
        mostrarSucesso('Login realizado com sucesso!');
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);
      } else {
        mostrarErro(resultado.message || 'Credenciais inválidas');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Entrar';
        
        if (resultado.message.includes('matrícula')) {
          matriculaInput.classList.add('is-invalid');
        } else if (resultado.message.includes('senha')) {
          senhaInput.classList.add('is-invalid');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      mostrarErro('Erro de conexão. Verifique sua internet e tente novamente.');
      btnLogin.disabled = false;
      btnLogin.textContent = 'Entrar';
    }
  });
  
  btnDemo.addEventListener('click', (e) => {
    e.preventDefault();
    
    matriculaInput.value = '12345';
    senhaInput.value = '12345';
    
    btnLogin.click();
  });
  
  [matriculaInput, senhaInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      erroDiv.textContent = '';
    });
  });
  
  senhaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btnLogin.click();
    }
  });
  
  function verificarLoginExistente() {
    const authData = localStorage.getItem('chama-sos-auth') || sessionStorage.getItem('chama-sos-auth');
    
    if (authData) {
      try {
        const { usuario } = JSON.parse(authData);
        matriculaInput.value = usuario.matricula;
        senhaInput.focus();
      } catch (e) {
      }
    }
  }
  
  function mostrarErro(mensagem) {
    erroDiv.textContent = mensagem;
    erroDiv.className = 'helper-text text-danger fw-bold';
    erroDiv.style.display = 'block';
  }
  
  function mostrarSucesso(mensagem) {
    erroDiv.textContent = mensagem;
    erroDiv.className = 'helper-text text-success fw-bold';
    erroDiv.style.display = 'block';
  }
  
  if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado no login:', registration);
      })
      .catch(err => {
        console.warn('Service Worker não registrado:', err);
      });
  }
  
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    mostrarBotaoInstalacao();
  });
  
  function mostrarBotaoInstalacao() {
    const installButton = document.createElement('button');
    installButton.className = 'btn btn-outline-primary w-100 mt-2';
    installButton.innerHTML = '📱 Instalar App';
    installButton.onclick = instalarPWA;
    
    const card = document.querySelector('.card');
    card.appendChild(installButton);
  }
  
  function instalarPWA() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        }
        deferredPrompt = null;
      });
    }
  }
});