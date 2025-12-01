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

  // 🔍 Verificar si ya existe un certificado previamente generado
  let certificadoExiste = false;
  try {
    const resExiste = await fetch(`https://nuevo-production-e70c.up.railway.app/api/certificados/existe/${userId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (resExiste.ok) {
      const data = await resExiste.json();
      certificadoExiste = data.existe === true;
    }
  } catch (err) {
    console.warn("No se pudo verificar si existe el certificado.");
  }

  try {
    const resExamenes = await fetch(`https://nuevo-production-e70c.up.railway.app/api/examenes/todos`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    if (!resExamenes.ok) throw new Error("Error al obtener exámenes");
    const examenes = await resExamenes.json();

    const resResultados = await fetch(`https://nuevo-production-e70c.up.railway.app/api/examenes/resultados/alumno/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });
    if (!resResultados.ok) throw new Error("Error al obtener resultados");
    const resultados = await resResultados.json();

    const resultadosMap = {};
    resultados.forEach(r => {
      const examenId = r.examen?.id || r.examenId || r.idExamen;
      if (examenId) resultadosMap[examenId] = r.calificacion;
    });

    listaCursos.innerHTML = "";
    let todosRespondidos = true;
    let todosAprobados = true;

    examenes.forEach(examen => {
      const calificacion = resultadosMap[examen.id];
      const respondido = calificacion !== undefined;
      const aprobado = respondido && calificacion >= 8;

      if (!respondido) todosRespondidos = false;
      if (!aprobado) todosAprobados = false;

      const div = document.createElement("div");
      div.className = `curso-card ${aprobado ? "aprobado" : "reprobado"}`;

      div.innerHTML = `
        <h3>${examen.titulo || "Examen sin título"}</h3>
        <p><strong>Instructor:</strong> ${examen.instructor?.name || "No especificado"}</p>
        <p><strong>Descripción:</strong> ${examen.descripcion || "Sin descripción disponible"}</p>
        <p><strong>Respondido:</strong> ${respondido ? "✅ Sí" : "❌ No"}</p>
        <p><strong>Calificación:</strong> ${respondido ? calificacion : "—"}</p>
      `;

      listaCursos.appendChild(div);
    });

    // Estado para mostrar mensaje al usuario
    if (certificadoExiste) {
      mensaje.textContent = "🎓 Ya tienes un certificado generado. Puedes descargarlo nuevamente.";
      btnCertificado.disabled = false;
    } else if (todosRespondidos && todosAprobados && examenes.length > 0) {
      mensaje.textContent = "🎉 ¡Felicidades! Puedes generar tu certificado.";
      btnCertificado.disabled = false;
    } else {
      mensaje.textContent = "⚠️ Aún no puedes generar el certificado. Responde y aprueba todos los cursos.";
      btnCertificado.disabled = true;
    }

    // 🔹 Acción del botón de certificado
    btnCertificado.addEventListener("click", async () => {
      try {
        // 🟦 SI YA EXISTE → solo descarga
        if (certificadoExiste) {
          return descargarCertificado(userId);
        }

        // 🟩 SI NO EXISTE → generar y descargar
        const generarResp = await fetch(`https://nuevo-production-e70c.up.railway.app/api/certificados/generar`, {
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

        certificadoExiste = true; // ⬅️ Marcamos como generado

        await descargarCertificado(userId);

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

async function descargarCertificado(userId) {
  const resp = await fetch(`https://nuevo-production-e70c.up.railway.app/api/certificados/descargar/${userId}`);
  if (!resp.ok) throw new Error("Error al descargar certificado");

  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificado_${userId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function volverAlMenu() {
  window.location.href = "../index.html";
}
