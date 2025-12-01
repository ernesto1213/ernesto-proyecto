document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Script de examen iniciado");

  // 🔹 Obtener elementos del DOM con fallback
  const mensaje = document.getElementById("mensaje") || {};
  const contenedor = document.getElementById("preguntas-contenedor") || {};
  const timerEl = document.getElementById("timer") || {};
  const resultadoEl = document.getElementById("resultado") || {};
  const botonEnviar = document.getElementById("enviar-examen");

  if (!document.getElementById("mensaje")) console.warn("⚠️ Falta elemento con id 'mensaje'");
  if (!document.getElementById("preguntas-contenedor")) console.warn("⚠️ Falta elemento con id 'preguntas-contenedor'");
  if (!document.getElementById("timer")) console.warn("⚠️ Falta elemento con id 'timer'");
  if (!document.getElementById("resultado")) console.warn("⚠️ Falta elemento con id 'resultado'");
  if (!botonEnviar) console.warn("⚠️ Falta botón con id 'enviar-examen'");

  // 🔹 Obtener token, userId y examenId
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const urlParams = new URLSearchParams(window.location.search);
  const examenId = urlParams.get("examenId");

  console.log("DEBUG: token =", token);
  console.log("DEBUG: userId =", userId);
  console.log("DEBUG: examenId =", examenId);

  // 🔹 Validar datos
  if (!token) {
    mensaje.textContent = "⚠️ No se encontró token. Debes iniciar sesión primero.";
    return;
  }
  if (!userId) {
    mensaje.textContent = "⚠️ No se encontró userId. Debes iniciar sesión primero.";
    return;
  }

  // 🔹 Cargar preguntas
  try {
    const res = await fetch(`https://nuevo-production-e70c.up.railway.app/api/examenes/${examenId}/preguntas`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error(`Error al obtener preguntas: ${res.status} ${res.statusText}`);
    const preguntas = await res.json();

    if (!preguntas || preguntas.length === 0) {
      contenedor.innerHTML = "<p>No hay preguntas registradas para este examen.</p>";
      return;
    }

    // Mostrar preguntas
    preguntas.forEach((pregunta, index) => {
      const div = document.createElement("div");
      div.className = "pregunta-card";

      let html = `<p><strong>${index + 1}. ${pregunta.texto}</strong></p>`;

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
    console.error("🚨 Error cargando preguntas:", error);
    mensaje.textContent = "❌ No se pudieron cargar las preguntas del examen.";
  }

  // 🔹 Función para enviar respuestas
  async function enviarRespuestas() {
    const respuestas = [];
    document.querySelectorAll(".pregunta-card").forEach(card => {
      const input = card.querySelector("input[type='radio']:checked");
      const textarea = card.querySelector("textarea");
      const idPregunta = card.querySelector("input, textarea")?.name.split("-")[1];
      const respuesta = input ? input.value : textarea?.value.trim();

      if (idPregunta && respuesta) {
        respuestas.push({ preguntaId: idPregunta, respuesta });
      }
    });

    if (respuestas.length === 0) {
      alert("⚠️ Debes contestar al menos una pregunta.");
      return;
    }

    try {
      const envio = await fetch(`https://nuevo-production-e70c.up.railway.app/api/examenes/${examenId}/responder/${userId}`, {
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

      if (!envio.ok) throw new Error(`Error al enviar respuestas: ${envio.status} ${envio.statusText}`);

      const evalRes = await fetch(`https://nuevo-production-e70c.up.railway.app/api/examenes/${examenId}/evaluar/${userId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!evalRes.ok) throw new Error(`Error al evaluar examen: ${evalRes.status} ${evalRes.statusText}`);
      const evaluacion = await evalRes.json();

      resultadoEl.textContent = `🎯 Resultado final: ${evaluacion.calificacion ?? 'Pendiente'} / 10`;

      if (evaluacion.calificacion >= 8) {
        alert("✅ ¡Examen aprobado!");
      }

      volverAExamenes();

    } catch (error) {
      console.error("🚨 Error al enviar o evaluar examen:", error);
      alert("❌ Ocurrió un error al enviar o evaluar el examen. Revisa la consola.");
    }
  }

  // 🔹 Evento botón enviar
  if (botonEnviar) {
    botonEnviar.addEventListener("click", enviarRespuestas);
  }

  // 🔹 TIMER opcional
  if (timerEl) {
    let tiempoRestante = 15 * 60; // segundos
    const timerInterval = setInterval(() => {
      const min = Math.floor(tiempoRestante / 60).toString().padStart(2, "0");
      const sec = (tiempoRestante % 60).toString().padStart(2, "0");
      timerEl.textContent = `⏳ Tiempo restante: ${min}:${sec}`;
      tiempoRestante--;

      if (tiempoRestante < 0) {
        clearInterval(timerInterval);
        alert("⌛ Se terminó el tiempo. El examen se enviará automáticamente.");
        enviarRespuestas();
      }
    }, 1000);
  }
});

// 🔹 Función para volver a la lista de exámenes
function volverAExamenes() {
  window.location.href = "../evaluaciones.html";
}
