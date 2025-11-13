document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Debes iniciar sesión primero.");
    window.location.href = "../login/login.html";
    return;
  }
});
document.addEventListener("DOMContentLoaded", async () => {
  const saludoDiv = document.getElementById("saludo");
  const menuDiv = document.getElementById("menu");
  const lista = document.getElementById("lista-cursos");

  // Obtener datos de usuario
  const userName = localStorage.getItem("userName") || "Usuario";
  const rango = parseInt(localStorage.getItem("userRango")) || 1; // 1=normal, 2=intermedio, 3=admin
  saludoDiv.textContent = `Bienvenido, ${userName} 🚀`;

  // Mostrar botones según rango
  if (rango === 1) {
    menuDiv.innerHTML = `
      <button class="menu-button" onclick="irACursos()">📘 Cursos Técnicos</button>
      <button class="menu-button" onclick="irASimulador()">⚙️ Simulador</button>
      <button class="menu-button" onclick="irAEvaluaciones()">🧠 Evaluaciones</button>
      <button class="menu-button" onclick="irACertificados()">📜 Certificados</button>
      <button class="menu-button" onclick="irACrearExamenes()">📜 Crear Examenes</button>
      <button class="menu-button" onclick="irAGestionUsuarios()">👥 Gestionar Usuarios</button>
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
  }

  // Cargar cursos desde JSON
  try {
    const response = await fetch("./data/cursos.json");
    const cursos = await response.json();

    cursos.forEach(curso => {
      const div = document.createElement("div");
      div.className = "curso-card";
      div.innerHTML = `
        <h3>${curso.nombre}</h3>
        <p>${curso.descripcion}</p>
        <p><strong>Nivel:</strong> ${curso.nivel}</p>
        <button onclick="abrirCurso('${curso.url}')">Ir al Curso 🎓</button>
      `;
      lista.appendChild(div);
    });
  } catch (err) {
    console.error("Error al cargar cursos:", err);
    lista.innerHTML = "<p>No se pudieron cargar los cursos.</p>";
  }
});
// Abrir curso en nueva pestaña
function abrirCurso(url) {
  window.open(url, "_blank");
}

// Funciones de navegación
function irACursos() { window.location.href = "../cursos/cursos.html"; }
function irASimulador() { window.location.href = "../simulador/simulador.html"; }
function irAEvaluaciones() { window.location.href = "../evaluaciones/evaluaciones.html"; }
function irACertificados() { window.location.href = "../certificados/certificados.html"; }
function irACrearExamenes() { window.location.href = "../crear-examen/crear-examen.html"; }
function irAGestionUsuarios() {window.location.href = "../gestion-usuarios/gestion-usuarios.html";}

function irAGestion() { window.location.href = "gestion.html"; }
function irAEstadisticas() { window.location.href = "estadisticas.html"; }
function irAPracticas() { window.location.href = "practicas.html"; }

function irAUsuarios() { window.location.href = "usuarios.html"; }
function irAReportes() { window.location.href = "reportes.html"; }
function irAIntegraciones() { window.location.href = "integraciones.html"; }

// Logout
// 🔒 Cerrar sesión
function logout() {
  localStorage.clear(); // elimina token, userId, etc.
  window.location.href = "../login/login.html"; // redirige al login
}

