document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Tomamos los valores del formulario
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    const registerData = { name, email, password };
    console.log('📦 Datos enviados (registro):', registerData);

    try {
      const response = await fetch('http://localhost:8080/api/login/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();
      console.log('📩 Respuesta registro:', data);

      if (response.ok && data.status === 'ok') {
        alert('✅ Registro exitoso');
        window.location.href = '../login/login.html'; // Redirige al login
      } else {
        alert('❌ ' + (data.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('🚨 Error al hacer registro:', error);
      alert('❌ Error de conexión con el servidor');
    }
  });
});
