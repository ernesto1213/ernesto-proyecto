document.addEventListener("DOMContentLoaded", () => {
  const preguntasDiv = document.getElementById("preguntas");
  const agregarBtn = document.getElementById("agregarPregunta");
  const form = document.getElementById("formExamen");
  const mensaje = document.getElementById("mensaje");

  agregarBtn.addEventListener("click", agregarPregunta);

  function agregarPregunta() {
    const preguntaDiv = document.createElement("div");
    preguntaDiv.classList.add("pregunta");

    preguntaDiv.innerHTML = `
      <label>Texto de la pregunta:</label>
      <input type="text" class="textoPregunta" required>
      <label>Tipo:</label>
      <select class="tipoPregunta">
        <option value="multiple-choice">Opción múltiple</option>
      </select>

      <div class="opciones"></div>
      <button type="button" class="agregarOpcion">➕ Agregar Opción</button>
      <button type="button" class="eliminarPregunta">❌ Eliminar Pregunta</button>
    `;

    preguntaDiv.querySelector(".agregarOpcion").addEventListener("click", () => agregarOpcion(preguntaDiv));
    preguntaDiv.querySelector(".eliminarPregunta").addEventListener("click", () => preguntaDiv.remove());
    preguntasDiv.appendChild(preguntaDiv);
  }

  function agregarOpcion(preguntaDiv) {
    const opcionesDiv = preguntaDiv.querySelector(".opciones");
    const opcionDiv = document.createElement("div");
    opcionDiv.classList.add("opcion");
    opcionDiv.innerHTML = `
      <input type="text" class="textoOpcion" placeholder="Texto de la opción" required>
      <label><input type="checkbox" class="esCorrecta"> Correcta</label>
      <button type="button" class="eliminarOpcion">🗑️</button>
    `;
    opcionDiv.querySelector(".eliminarOpcion").addEventListener("click", () => opcionDiv.remove());
    opcionesDiv.appendChild(opcionDiv);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const instructorId = parseInt(document.getElementById("instructorId").value);
    const preguntas = [];

    document.querySelectorAll(".pregunta").forEach(p => {
      const texto = p.querySelector(".textoPregunta").value;
      const tipo = p.querySelector(".tipoPregunta").value;
      const opciones = [];

      p.querySelectorAll(".opcion").forEach(o => {
        const textoOpcion = o.querySelector(".textoOpcion").value;
        const correcta = o.querySelector(".esCorrecta").checked;
        opciones.push({ texto: textoOpcion, correcta });
      });

      preguntas.push({ texto, tipo, opciones });
    });

    const examenData = {
      titulo,
      descripcion,
      instructor: { id: instructorId },
      preguntas
    };

    try {
      const res = await fetch("http://localhost:8080/api/examenes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examenData)
      });

      if (res.ok) {
        const data = await res.json();
        mensaje.textContent = `✅ Examen creado correctamente con ID ${data.id || "(sin ID)"}`;
        mensaje.style.color = "green";
        form.reset();
        preguntasDiv.innerHTML = "";
      } else {
        const errorText = await res.text();
        mensaje.textContent = "❌ Error al crear examen: " + errorText;
        mensaje.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      mensaje.textContent = "⚠️ Error de conexión con el servidor";
      mensaje.style.color = "red";
    }
  });
});
