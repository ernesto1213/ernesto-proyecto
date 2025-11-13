document.addEventListener("DOMContentLoaded", async () => {
  const mensaje = document.getElementById("mensaje");
  const lista = document.getElementById("lista-cursos");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    mensaje.textContent = "⚠️ No has iniciado sesión.";
    return;
  }

  try {
    // 🔹 Obtener todos los exámenes disponibles
    const resExamenes = await fetch(`http://localhost:8080/api/examenes/todos`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!resExamenes.ok) throw new Error("Error al obtener exámenes");
    const examenes = await resExamenes.json();

    // 🔹 Obtener los resultados del alumno (exámenes respondidos)
    const resResultados = await fetch(`http://localhost:8080/api/examenes/resultados/alumno/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });
    if (!resResultados.ok) throw new Error("Error al obtener resultados");
    const resultados = await resResultados.json();

    // 🔹 Convertir resultados a un mapa: examenId -> calificación
    const resultadosMap = {};
resultados.forEach(r => {
  const examenId = r.examen?.id || r.examenId || r.idExamen; // tolera distintas estructuras
  if (examenId) {
    resultadosMap[examenId] = r.calificacion;
  }
});


    // 🔹 Mostrar exámenes
    if (examenes.length === 0) {
      lista.innerHTML = "<p>No tienes exámenes registrados.</p>";
      return;
    }

    examenes.forEach(examen => {
      const div = document.createElement("div");
      div.className = "curso-card";

      const calificacion = resultadosMap[examen.id];
      const respondido = calificacion !== undefined;

      div.innerHTML = `
        <h3>${examen.titulo || "Examen sin título"}</h3>
        <p><strong>Instructor:</strong> ${examen.instructor?.name || "No especificado"}</p>
        <p><strong>Descripción:</strong> ${examen.descripcion || "Sin descripción disponible"}</p>
        ${
          respondido
            ? `<p class="resultado-aprobado">✅ Ya respondido — Calificación: <strong>${calificacion}</strong></p>`
            : `<button onclick="verExamen(${examen.id})">📄 Realizar Examen</button>`
        }
      `;

      lista.appendChild(div);
    });

    mensaje.textContent = "📘 Estos son tus exámenes disponibles:";

  } catch (error) {
    console.error("🚨 Error al cargar exámenes:", error);
    mensaje.textContent = "❌ No se pudieron cargar los exámenes.";
  }
});

// 🔹 Ver detalles del examen (solo si no está contestado)
function verExamen(examenId) {
  window.location.href = `../evaluaciones/examen/examen.html?examenId=${examenId}`;
}

// 🔹 Volver al menú
function volverAlMenu() {
  window.location.href = "../index.html";
}
