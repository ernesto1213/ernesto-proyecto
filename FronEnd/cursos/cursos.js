document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const mensaje = document.getElementById("mensaje");
  const lista = document.getElementById("lista-cursos");

  if (!token || !userId) {
    mensaje.textContent = "⚠️ No has iniciado sesión.";
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/api/cursos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Error al obtener cursos");

    const cursos = await response.json();
    console.log("📚 Cursos obtenidos:", cursos);

    if (cursos.length === 0) {
      lista.innerHTML = "<p>No hay cursos disponibles.</p>";
      return;
    }

    cursos.forEach(curso => {
      const div = document.createElement("div");
      div.className = "curso-card";
      div.innerHTML = `
        <h3>${curso.nombre}</h3>
        <p>${curso.descripcion}</p>
        <button onclick="verDetalles(${curso.id})">Ver Detalles</button>
      `;
      lista.appendChild(div);
    });

  } catch (error) {
    console.error("🚨 Error:", error);
    mensaje.textContent = "Error al cargar los cursos.";
  }
});

function verDetalles(id) {
  window.location.href = `curso-detalle.html?id=${id}`;
}

function volverAlMenu() {
  window.location.href = "../menu/menu.html";
}
