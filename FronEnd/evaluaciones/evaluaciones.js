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
    // 🔹 Llamada a la API (equivalente al curl)
    const res = await fetch(`http://localhost:8080/api/examenes/instructor/${userId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Error al obtener los exámenes del instructor");

    const examenes = await res.json();

    if (examenes.length === 0) {
      lista.innerHTML = "<p>No tienes exámenes registrados.</p>";
      return;
    }

    // 🔹 Mostrar exámenes
    examenes.forEach(examen => {
      const div = document.createElement("div");
      div.className = "curso-card";
      div.innerHTML = `
        <h3>${examen.nombre || "Examen sin nombre"}</h3>
        <p><strong>Curso:</strong> ${examen.curso?.nombre || "No especificado"}</p>
        <p><strong>Descripción:</strong> ${examen.descripcion || "Sin descripción disponible"}</p>
        <button onclick="verExamen(${examen.id})">📄 Ver Examen</button>
      `;
      lista.appendChild(div);
    });

    mensaje.textContent = "📘 Estos son tus exámenes registrados:";

  } catch (error) {
    console.error("🚨 Error al cargar exámenes:", error);
    mensaje.textContent = "❌ No se pudieron cargar los exámenes.";
  }
});

// 🔹 Ver detalles del examen
function verExamen(examenId) {
  window.location.href = `../evaluaciones/examen/examen.html?examenId=${examenId}`;
}

// 🔹 Volver al menú
function volverAlMenu() {
  window.location.href = "../menu/menu.html";
}
