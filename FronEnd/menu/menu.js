document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const saludoDiv = document.getElementById("saludo");
  const menuDiv = document.getElementById("menu");

  if (!userId || !token) {
    console.warn('⚠️ No hay userId o token en localStorage');
    saludoDiv.innerText = "Bienvenido al Sistema Naval";
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/login/consulta/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    const data = await response.json();
    console.log('📩 Datos del usuario:', data);

    const rango = data.rango;
    saludoDiv.innerText = `Bienvenido, ${data.name}`;

    // Mostrar botones según rango
    if (rango === 1) {
      menuDiv.innerHTML = `
        <button class="menu-button" onclick="irACursos()">📘 Cursos Técnicos</button>
        <button class="menu-button" onclick="irASimulador()">⚙️ Simulador</button>
        <button class="menu-button" onclick="irAEvaluaciones()">🧠 Evaluaciones</button>
        <button class="menu-button" onclick="irACertificados()">📜 Certificados</button>
      `;
    } else if (rango === 2) {
      menuDiv.innerHTML = `
        <button class="menu-button" onclick="irAGestion()">📂 Gestión de Contenidos</button>
        <button class="menu-button" onclick="irAEstadisticas()">📊 Desempeño</button>
        <button class="menu-button" onclick="irAPracticas()">🧰 Panel de Prácticas</button>
      `;
    } else if (rango === 3) {
      menuDiv.innerHTML = `
        <button class="menu-button" onclick="irAUsuarios()">👥 Gestión de Usuarios</button>
        <button class="menu-button" onclick="irAReportes()">📈 Reportes</button>
        <button class="menu-button" onclick="irAIntegraciones()">🔗 Integraciones</button>
      `;
    } else {
      menuDiv.innerHTML = `<p>No se encontró un rango válido para este usuario.</p>`;
    }

  } catch (error) {
    console.error('🚨 Error al consultar API:', error);
    saludoDiv.innerText = "Error al cargar datos del usuario";
  }
});

// 🔒 Cerrar sesión
function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  window.location.href = "../login/login.html"; // vuelve al login
}

// 🌐 Funciones de navegación
function irACursos() { window.location.href = "cursos.html"; }
function irASimulador() { window.location.href = "simulador.html"; }
function irAEvaluaciones() { window.location.href = "evaluaciones.html"; }
function irACertificados() { window.location.href = "certificados.html"; }

function irAGestion() { window.location.href = "gestion.html"; }
function irAEstadisticas() { window.location.href = "estadisticas.html"; }
function irAPracticas() { window.location.href = "practicas.html"; }

function irAUsuarios() { window.location.href = "usuarios.html"; }
function irAReportes() { window.location.href = "reportes.html"; }
function irAIntegraciones() { window.location.href = "integraciones.html"; }
