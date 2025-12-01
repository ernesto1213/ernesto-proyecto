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
  const rango = localStorage.getItem("rango") || "Estudiante"; // 1=normal, 2=intermedio, 3=admin
  console.log("rango: "+rango);
  
  saludoDiv.textContent = `Bienvenido, ${userName} 🚀`;

  // Mostrar botones según rango
  if (rango === "Admin" || rango === "Jefe") {
    menuDiv.innerHTML = `
<button class="menu-button" onclick="irACursos()">📘 Cursos Técnicos</button>
<button class="menu-button" onclick="irAEvaluaciones()">📝 Evaluaciones</button>
<button class="menu-button" onclick="irACertificados()">🎓 Certificados</button>
<button class="menu-button" onclick="irAEditarExamenes()">✏️ Editar Exámenes</button>
<button class="menu-button" onclick="irACrearExamenes()">➕ Crear Exámenes</button>
<button class="menu-button" onclick="irAGestionUsuarios()">👥 Gestionar Usuarios</button>

    `;
  } else if (rango === "Estudiante" || rango ==="Tecnico") {
    menuDiv.innerHTML = `
      <button class="menu-button" onclick="irACursos()">📘 Cursos Técnicos</button>
      <button class="menu-button" onclick="irAEvaluaciones()">🧠 Evaluaciones</button>
      <button class="menu-button" onclick="irACertificados()">📜 Certificados</button>
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
  }

  // Inicializar actualización de temperatura
  actualizarTemperatura();
  setInterval(actualizarTemperatura, 3000); // cada 3 segundos
});

// Abrir curso en nueva pestaña
function abrirCurso(url) {
  window.open(url, "_blank");
}

// Funciones de navegación
function irACursos() { window.location.href = "../cursos/cursos.html"; }
function irAEditarExamenes() { window.location.href = "../editExamenes/edit-examenes.html"; }
function irAEvaluaciones() { window.location.href = "../evaluaciones/evaluaciones.html"; }
function irACertificados() { window.location.href = "../certificados/certificados.html"; }
function irACrearExamenes() { window.location.href = "../crear-examen/crear-examen.html"; }
function irAGestionUsuarios() { window.location.href = "../gestion-usuarios/gestion-usuarios.html"; }

function irAGestion() { window.location.href = "gestion.html"; }
function irAEstadisticas() { window.location.href = "estadisticas.html"; }
function irAPracticas() { window.location.href = "practicas.html"; }

function irAUsuarios() { window.location.href = "usuarios.html"; }
function irAReportes() { window.location.href = "reportes.html"; }
function irAIntegraciones() { window.location.href = "integraciones.html"; }

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "../index.html";
}

// ======== API Temperatura ========
async function actualizarTemperatura() {
  try {
    const response = await fetch("https://nuevo-production-e70c.up.railway.app/api/evaluaciones/ultimaTemperatura");
    if (!response.ok) throw new Error("Error al obtener la temperatura");
    const data = await response.json();

    document.getElementById("temperaturaValor").textContent = 
      `Ambiente: ${data.ambiente} °C | Objeto: ${data.objeto} °C`;

    const fecha = new Date(data.timestamp || Date.now());
    document.getElementById("temperaturaHora").textContent = 
      `Última actualización: ${fecha.toLocaleTimeString()}`;

  } catch (err) {
    console.error(err);
    document.getElementById("temperaturaValor").textContent = "No se pudo cargar la temperatura.";
  }
}
