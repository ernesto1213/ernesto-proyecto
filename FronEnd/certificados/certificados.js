document.addEventListener("DOMContentLoaded", async () => {
  const mensaje = document.getElementById("mensaje");
  const listaCursos = document.getElementById("lista-cursos");
  const btnCertificado = document.getElementById("btn-certificado");

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
      const examenId = r.examen?.id || r.examenId || r.idExamen;
      if (examenId) resultadosMap[examenId] = r.calificacion;
    });

    // 🔹 Mostrar exámenes con su estado
    listaCursos.innerHTML = "";
    let todosRespondidos = true;
    let todosAprobados = true;

    examenes.forEach(examen => {
      const calificacion = resultadosMap[examen.id];
      const respondido = calificacion !== undefined;
      const aprobado = respondido && calificacion >= 8;

      // si falta uno sin responder o reprobado, se bloquea certificado
      if (!respondido) todosRespondidos = false;
      if (!aprobado) todosAprobados = false;

      const div = document.createElement("div");
      div.className = `curso ${aprobado ? "aprobado" : "reprobado"}`;

      div.innerHTML = `
        <h3>${examen.titulo || "Examen sin título"}</h3>
        <p><strong>Instructor:</strong> ${examen.instructor?.name || "No especificado"}</p>
        <p><strong>Descripción:</strong> ${examen.descripcion || "Sin descripción disponible"}</p>
        <p>Respondido: ${respondido ? "✅ Sí" : "❌ No"}</p>
        <p>Calificación: ${respondido ? calificacion : "—"}</p>
      `;

      listaCursos.appendChild(div);
    });

    // 🔹 Evaluar si puede generar certificado
    if (todosRespondidos && todosAprobados && examenes.length > 0) {
      mensaje.textContent = "🎉 ¡Felicidades! Puedes generar tu certificado.";
      btnCertificado.disabled = false;
    } else {
      mensaje.textContent = "⚠️ Aún no puedes generar el certificado. Responde y aprueba todos los cursos.";
      btnCertificado.disabled = true;
    }

    // 🔹 Acción del botón de certificado
    btnCertificado.addEventListener("click", async () => {
      try {
        const generarResp = await fetch(`http://localhost:8080/api/certificados/generar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            alumnoId: parseInt(userId),
            titulo: "Certificación de Capacitación",
            emitidoPor: "Centro de Capacitación Naval",
            guardarRegistro: true
          })
        });

        if (!generarResp.ok) throw new Error("Error al generar certificado");

        // Descargar certificado
        const descargarResp = await fetch(`http://localhost:8080/api/certificados/descargar/${userId}`);
        if (!descargarResp.ok) throw new Error("Error al descargar certificado");

        const blob = await descargarResp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificado_${userId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        mensaje.textContent = "✅ Certificado generado y descargado correctamente.";
      } catch (error) {
        console.error(error);
        mensaje.textContent = "❌ Error al generar o descargar el certificado.";
      }
    });

  } catch (error) {
    console.error("🚨 Error al cargar datos:", error);
    mensaje.textContent = "❌ No se pudieron cargar los exámenes.";
  }
});

function volverAlMenu() {
  window.location.href = "../index.html";
}
