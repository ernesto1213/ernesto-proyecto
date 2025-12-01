const examenSelect = document.getElementById('examenSelect');
const editor = document.getElementById('editor');
const tituloInput = document.getElementById('titulo');
const descripcionInput = document.getElementById('descripcion');
const preguntasContainer = document.getElementById('preguntasContainer');
const addPreguntaBtn = document.getElementById('addPreguntaBtn');
const guardarBtn = document.getElementById('guardarExamenBtn');
const btnEliminarExamen = document.getElementById('btnEliminarExamen');

// MODAL
const modal = document.getElementById('modalEliminar');
const btnConfirmarEliminar = document.getElementById('confirmarEliminar');
const btnCancelarEliminar = document.getElementById('cancelarEliminar');

let examenActual = null;

// 🔹 Cargar exámenes
fetch('https://nuevo-production-e70c.up.railway.app/api/examenes/todos')
    .then(res => res.json())
    .then(data => {
        data.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex.id;
            option.textContent = ex.titulo;
            examenSelect.appendChild(option);
        });
    });

// 🔹 Selección de examen
examenSelect.addEventListener('change', async () => {
    const id = examenSelect.value;
    if (!id) {
        editor.style.display = 'none';
        btnEliminarExamen.style.display = 'none';
        return;
    }

    const res = await fetch(`https://nuevo-production-e70c.up.railway.app/api/examenes/${id}`);
    examenActual = await res.json();

    tituloInput.value = examenActual.titulo;
    descripcionInput.value = examenActual.descripcion;

    renderPreguntas();
    editor.style.display = 'block';
    btnEliminarExamen.style.display = 'inline-block';
});

// 🔹 Render preguntas
function renderPreguntas() {
    preguntasContainer.querySelectorAll('.pregunta').forEach(p => p.remove());

    examenActual.preguntas.forEach((preg, index) => {
        const div = document.createElement('div');
        div.className = 'pregunta';

        const textoInput = document.createElement('input');
        textoInput.value = preg.texto;
        textoInput.placeholder = "Texto de la pregunta";
        div.appendChild(textoInput);

        const delPregunta = document.createElement('button');
        delPregunta.textContent = "🗑️ Eliminar pregunta";
        delPregunta.className = "btn-eliminarPregunta";
        delPregunta.type = "button";
        delPregunta.onclick = () => {
            examenActual.preguntas.splice(index, 1);
            renderPreguntas();
        };
        div.appendChild(delPregunta);

        const opcionesDiv = document.createElement('div');

        preg.opciones.forEach((opc, i) => {
            opcionesDiv.appendChild(crearOpcion(opc.texto, opc.correcta, index, i));
        });

        const addOpcionBtn = document.createElement('button');
        addOpcionBtn.textContent = '➕ Agregar opción';
        addOpcionBtn.type = 'button';
        addOpcionBtn.addEventListener('click', () => {
            opcionesDiv.appendChild(crearOpcion("", false, index));
        });

        div.appendChild(opcionesDiv);
        div.appendChild(addOpcionBtn);

        preguntasContainer.appendChild(div);
    });
}

function crearOpcion(texto, correcta, preguntaIndex) {
    const div = document.createElement('div');
    div.className = "opcion-row";

    const radio = document.createElement('input');
    radio.type = "radio";
    radio.name = `correcta_${preguntaIndex}`;
    radio.checked = correcta;

    const input = document.createElement('input');
    input.type = "text";
    input.placeholder = "Texto de la opción";
    input.value = texto;
    input.className = "input-opcion";

    const delBtn = document.createElement('button');
    delBtn.textContent = "❌";
    delBtn.type = "button";
    delBtn.className = "btn-eliminar";
    delBtn.onclick = () => div.remove();

    div.appendChild(radio);
    div.appendChild(input);
    div.appendChild(delBtn);

    return div;
}

// 🔹 Agregar nueva pregunta
addPreguntaBtn.addEventListener('click', () => {
    examenActual.preguntas.push({
        texto: '',
        tipo: 'multiple-choice',
        opciones: []
    });
    renderPreguntas();
});

// 🔹 Guardar examen
guardarBtn.addEventListener('click', async () => {

    const examenToSend = {
        titulo: tituloInput.value,
        descripcion: descripcionInput.value,
        instructor: { id: examenActual.instructor.id },
        preguntas: []
    };

    const preguntaDivs = preguntasContainer.querySelectorAll('.pregunta');

    preguntaDivs.forEach(div => {
        const texto = div.querySelector('input').value;

        const opciones = [];
        div.querySelectorAll('.opcion-row').forEach(op => {
            const t = op.querySelector('input[type="text"]').value;
            const c = op.querySelector('input[type="radio"]').checked;
            opciones.push({ texto: t, correcta: c });
        });

        examenToSend.preguntas.push({
            texto,
            tipo: "multiple-choice",
            opciones
        });
    });

    const res = await fetch(
        `https://nuevo-production-e70c.up.railway.app/api/examenes/editar/${examenActual.id}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examenToSend)
        }
    );

    if (res.ok) alert('Examen actualizado correctamente');
    else alert('Error al actualizar');
});

// 🔹 Eliminar examen (mostrar modal)
btnEliminarExamen.addEventListener('click', () => {
    modal.style.display = "flex";
});

// 🔹 Cancelar
btnCancelarEliminar.addEventListener('click', () => {
    modal.style.display = "none";
});

// 🔥 CONFIRMAR ELIMINACIÓN
btnConfirmarEliminar.addEventListener('click', async () => {
    const id = examenActual.id;

    const res = await fetch(
        `https://nuevo-production-e70c.up.railway.app/api/examenes/examen/${id}`,
        {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" }
        }
    );

    if (res.ok) {
        alert("Examen eliminado correctamente");
        window.location.reload();
    } else {
        alert("Error al eliminar el examen");
    }
});

// 🔹 Volver menú
function volverAlMenu() {
  window.location.href = "../index.html";
}
function logout() {
  localStorage.clear();
  window.location.href = "../../index.html";
}
