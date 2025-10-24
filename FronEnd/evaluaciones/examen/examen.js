document.addEventListener("DOMContentLoaded", async () => {
  const mensaje = document.getElementById("mensaje");
  const contenedor = document.getElementById("preguntas-contenedor");
  const token = localStorage.getItem("token");
  const urlParams = new URLSearchParams(window.location.search);
  const examenId = urlParams.get("examenId");

  if (!token || !examenId) {
    mensaje.textContent = "⚠️ No se pudo cargar el examen.";
    return;
  }

  try {
    // 🔹 Obtener preguntas del examen
    const res = await fetch(`http://localhost:8080/api/examenes/${examenId}/preguntas`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Error al obtener preguntas del examen");
    const preguntas = await res.json();

    if (preguntas.length === 0) {
      contenedor.innerHTML = "<p>No hay preguntas registradas para este examen.</p>";
      return;
    }

    // 🔹 Mostrar cada pregunta con sus opciones
    preguntas.forEach((pregunta, index) => {
      const div = document.createElement("div");
      div.className = "pregunta-card";

      let html = `<p><strong>${index + 1}. ${pregunta.enunciado}</strong></p>`;

      if (pregunta.tipo === "multiple-choice" && pregunta.opciones.length > 0) {
        pregunta.opciones.forEach(op => {
          html += `
            <label>
              <input type="radio" name="pregunta-${pregunta.id}" value="${op.id}">
              ${op.texto}
            </label><br>
          `;
        });
      } else {
        html += `<textarea name="pregunta-${pregunta.id}" rows="3" cols="50"></textarea>`;
      }

      div.innerHTML = html;
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error("🚨 Error al cargar preguntas:", error);
    mensaje.textContent = "❌ No se pudieron cargar las preguntas del examen.";
  }
});

// 🔹 Botón para volver
function volverACursos() {
  window.location.href = "../evaluaciones/evaluaciones.html";
}
