document.addEventListener("DOMContentLoaded", () => {
  const preguntasDiv = document.getElementById("preguntas");
  const agregarBtn = document.getElementById("agregarPregunta");
  const form = document.getElementById("formExamen");
  const mensaje = document.getElementById("mensaje");

  const userId = parseInt(localStorage.getItem("userId")); // 🔹 ESTO SERÁ EL INSTRUCTOR

  if (!userId) {
    mensaje.textContent = "⚠️ Error: no hay usuario registrado.";
    mensaje.style.color = "red";
    return;
  }

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
      instructor: { id: userId },   // 🔥 AUTO ASIGNAR EL INSTRUCTOR
      preguntas
    };

    try {
      const res = await fetch("https://nuevo-production-e70c.up.railway.app/api/examenes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examenData)
      });

      if (res.ok) {
        const data = await res.json();
        mensaje.textContent = `✅ Examen creado correctamente con ID ${data.id}`;
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
document.getElementById("archivoExcel").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convierte a formato JSON (array de arrays)

      // Procesar las preguntas y opciones
      cargarPreguntasDesdeExcel(json);
    };
    reader.readAsBinaryString(file);
  }
});

function cargarPreguntasDesdeExcel(data) {
  // Limpiar preguntas actuales
  const preguntasDiv = document.getElementById("preguntas");
  preguntasDiv.innerHTML = "";

  // Recorrer los datos y agregar las preguntas
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {  // Verifica si hay pregunta
      const preguntaDiv = document.createElement("div");
      preguntaDiv.classList.add("pregunta");

      // Crear la pregunta
      preguntaDiv.innerHTML = `
        <label>Texto de la pregunta:</label>
        <input type="text" class="textoPregunta" value="${row[0]}" required>
        <label>Tipo:</label>
        <select class="tipoPregunta">
          <option value="multiple-choice" selected>Opción múltiple</option>
        </select>
        <div class="opciones"></div>
        <button type="button" class="agregarOpcion">➕ Agregar Opción</button>
        <button type="button" class="eliminarPregunta">❌ Eliminar Pregunta</button>
      `;

      // Agregar opciones (si existen)
      const opciones = row.slice(1); // Las opciones empiezan en la columna 2
      const opcionesDiv = preguntaDiv.querySelector(".opciones");
      opciones.forEach(opcion => {
        if (opcion) {
          const opcionDiv = document.createElement("div");
          opcionDiv.classList.add("opcion");
          opcionDiv.innerHTML = `
            <input type="text" class="textoOpcion" value="${opcion}" placeholder="Texto de la opción" required>
            <label><input type="checkbox" class="esCorrecta"> Correcta</label>
            <button type="button" class="eliminarOpcion">🗑️</button>
          `;
          opcionesDiv.appendChild(opcionDiv);
        }
      });

      preguntaDiv.querySelector(".agregarOpcion").addEventListener("click", () => agregarOpcion(preguntaDiv));
      preguntaDiv.querySelector(".eliminarPregunta").addEventListener("click", () => preguntaDiv.remove());
      preguntasDiv.appendChild(preguntaDiv);
    }
  }
}
document.getElementById("descargarExcel").addEventListener("click", () => {
  const wb = XLSX.utils.book_new();
  
  // Definir los encabezados
  const encabezados = ["Pregunta", "Opción 1", "Opción 2", "Opción 3", "Opción 4"];
  
  // Crear una fila de instrucciones
  const instrucciones = [
    ["Pregunta","Opción 1","Opción 2","Opción 3","Opción 4"],
    ["1. En la primera columna, ingresa el texto de la pregunta.","2. En la segunda columna, ingresa la primera opción.","3. En la tercera columna, ingresa la segunda opción.","4. En la cuarta columna, ingresa la tercera opción.","5. En la quinta columna, ingresa la cuarta opción."],
  ];

  // Convertir las instrucciones en formato adecuado
  const hojaInstrucciones = XLSX.utils.aoa_to_sheet(instrucciones);
  
  // Crear la hoja de preguntas
  const hojaPreguntas = XLSX.utils.aoa_to_sheet([encabezados]);

  // Agregar ambas hojas al libro
  XLSX.utils.book_append_sheet(wb, hojaInstrucciones, "Instrucciones");
  XLSX.utils.book_append_sheet(wb, hojaPreguntas, "Preguntas");

  // Descargar el archivo
  XLSX.writeFile(wb, "Formato_Examen.xlsx");
});

function volverAlMenu() {
  window.location.href = "../index.html";
}
function logout() {
  localStorage.clear();
  window.location.href = "../../index.html";
}