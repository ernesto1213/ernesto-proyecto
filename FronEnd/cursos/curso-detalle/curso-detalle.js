document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  try {
    // Subir un nivel porque estamos dentro de /curso-detalle/
    const response = await fetch("../data/cursos.json");
    const cursos = await response.json();
    const curso = cursos.find(c => c.id == id);

    if (!curso) {
      document.getElementById("info-curso").innerHTML = "<p>❌ Curso no encontrado.</p>";
      return;
    }

    document.getElementById("titulo").textContent = curso.nombre;
    document.getElementById("info-curso").innerHTML = `
      <h3>${curso.nombre}</h3>
      <p>${curso.descripcion}</p>
      <p><strong>Nivel:</strong> ${curso.nivel}</p>
    `;

    // Asignar el video local (también sube un nivel)
    document.getElementById("video-src").src = `../${curso.video}`;
  } catch (error) {
    console.error("🚨 Error al cargar el curso:", error);
    document.getElementById("info-curso").innerHTML = "<p>⚠️ Error al cargar los datos del curso.</p>";
  }
});

function volver() {
  window.location.href = "../cursos.html";
}
