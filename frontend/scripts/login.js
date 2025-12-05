const loginForm = document.getElementById('loginForm');
const erroDiv = document.getElementById('erro');
const demoLogin = document.getElementById('demoLogin');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const matricula = document.getElementById('matricula').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!matricula || !senha) {
    erroDiv.textContent = 'Preencha matrícula e senha';
    return;
  }

  erroDiv.textContent = '';

  if (matricula === 'juliana@email.com' && senha === '12345') {
    window.location.href = 'dashboard.html';
  } else {
    erroDiv.textContent = 'Matrícula ou senha incorretos';
  }
});

demoLogin.addEventListener('click', () => {
  document.getElementById('matricula').value = '12345';
  document.getElementById('senha').value = '12345';
  loginForm.dispatchEvent(new Event('submit'));
});
