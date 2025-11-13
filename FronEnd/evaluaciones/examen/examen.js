document.addEventListener("DOMContentLoaded", async () => {
  const mensaje = document.getElementById("mensaje");
  const contenedor = document.getElementById("preguntas-contenedor");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // ✅ aquí obtenemos el userId
  const urlParams = new URLSearchParams(window.location.search);
  const examenId = urlParams.get("examenId");

  if (!token || !examenId) {
    mensaje.textContent = "⚠️ No se pudo cargar el examen.";
    return;
  }

  try {
    // 🔹 Obtener preguntas
    const res = await fetch(`http://localhost:8080/api/examenes/${examenId}/preguntas`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Error al obtener preguntas del examen");
    const preguntas = await res.json();

    if (preguntas.length === 0) {
      contenedor.innerHTML = "<p>No hay preguntas registradas para este examen.</p>";
      return;
    }

    // 🔹 Mostrar preguntas
    preguntas.forEach((pregunta, index) => {
      const div = document.createElement("div");
      div.className = "pregunta-card";

      let html = `<p><strong>${index + 1}. ${pregunta.enunciado}</strong></p>`;

      if (pregunta.tipo === "multiple-choice" && pregunta.opciones?.length > 0) {
        pregunta.opciones.forEach(op => {
          html += `
            <label>
              <input type="radio" name="pregunta-${pregunta.id}" value="${op.id}">
              ${op.texto}
            </label>
          `;
        });
      } else {
        html += `<textarea name="pregunta-${pregunta.id}" rows="3"></textarea>`;
      }

      div.innerHTML = html;
      contenedor.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    mensaje.textContent = "❌ No se pudieron cargar las preguntas.";
  }

  // 🔹 Enviar respuestas
document.getElementById("enviar-examen").addEventListener("click", async () => {
  if (!userId) {
    alert("⚠️ No se encontró el ID del usuario.");
    return;
  }

  const respuestas = [];
  document.querySelectorAll(".pregunta-card").forEach(card => {
    const input = card.querySelector("input[type='radio']:checked");
    const textarea = card.querySelector("textarea");
    const idPregunta = card.querySelector("input, textarea").name.split("-")[1];
    let respuesta = null;

    if (input) respuesta = input.value;
    else if (textarea) respuesta = textarea.value.trim();

    if (respuesta) {
      respuestas.push({ preguntaId: idPregunta, respuesta });
    }
  });

  if (respuestas.length === 0) {
    alert("⚠️ Debes contestar al menos una pregunta.");
    return;
  }

  try {
    // 🔹 Guardar respuestas
    const envio = await fetch(`http://localhost:8080/api/examenes/${examenId}/responder/${userId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
        respuestas.map(r => ({
          pregunta: { id: parseInt(r.preguntaId) },
          opcion: isNaN(r.respuesta) ? null : { id: parseInt(r.respuesta) },
          respuestaTexto: isNaN(r.respuesta) ? r.respuesta : null
        }))
      )
    });

    if (!envio.ok) throw new Error("Error al enviar respuestas");

    // 🔹 Evaluar examen (y se guarda automáticamente en resultado_examen en el backend)
    const evalRes = await fetch(`http://localhost:8080/api/examenes/${examenId}/evaluar/${userId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!evalRes.ok) throw new Error("Error al evaluar examen");
    const evaluacion = await evalRes.json();

    // 🔹 Mostrar resultado
    document.getElementById("resultado").textContent =
      `🎯 Resultado final: ${evaluacion.calificacion ?? 'Pendiente'} / 100`;

    // 🔹 Si calificación >= 8, podrías agregar lógica adicional (por ejemplo, mostrar en lista de aprobados)
    if (evaluacion.calificacion >= 8) {
      alert("✅ ¡Examen aprobado!");
      // Aquí podrías actualizar tu frontend de "exámenes aprobados"
    }

  } catch (error) {
    console.error(error);
    alert("❌ Ocurrió un error al enviar o evaluar el examen.");
  }
});

});

function volverAExamenes() {
window.location.href = "../evaluaciones.html";
}

