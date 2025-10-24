document.addEventListener("DOMContentLoaded", () => {
  const mensaje = document.getElementById("mensaje");
  const lista = document.getElementById("lista-cursos");

  // Cursos estáticos
  const cursos = [
    {
      "id": 1,
      "nombre": "Transporte Marítimo",
      "descripcion": "Curso básico sobre transporte marítimo.",
      "nivel": "Básico",
      "url": "https://edutin.com/curso-de-transporte-maritimo-2127?utm_source=chatgpt.com"
    },
    {
      "id": 2,
      "nombre": "Diploma en Construcción Naval",
      "descripcion": "Curso básico sobre construcción naval.",
      "nivel": "Básico",
      "url": "https://alison.com/es?utm_source=chatgpt.com"
    },
    {
      "id": 3,
      "nombre": "Mantenimiento y Conservación del Buque",
      "descripcion": "Curso intermedio sobre mantenimiento de buques.",
      "nivel": "Intermedio",
      "url": "https://www.academiaintegral.com.es/cursos-gratis/certificados-de-profesionalidad/maritimo-pesquera/mf1298-1-mantenimiento-y-conservacion-del-buque-18461.html?utm_source=chatgpt.com"
    },
    {
      "id": 4,
      "nombre": "Operaciones de Bombeo en Buques",
      "descripcion": "Curso intermedio sobre carga y descarga de buques.",
      "nivel": "Intermedio",
      "url": "https://www.cursos-gratis-online.com/curso-gratis-online-trabajadores-mapn0412-operaciones-de-bombeo-para-carga-y-descarga-del-buque.html?utm_source=chatgpt.com"
    },
    {
      "id": 5,
      "nombre": "Máster en Reparación Naval",
      "descripcion": "Curso avanzado sobre reparación y mantenimiento de buques.",
      "nivel": "Avanzado",
      "url": "https://www.ime.es/curso-ime/master-reparacion-naval/?utm_source=chatgpt.com"
    },
    {
      "id": 6,
      "nombre": "Ingeniero en Mantenimiento Petrolero",
      "descripcion": "Curso avanzado en mantenimiento de equipos petroleros.",
      "nivel": "Avanzado",
      "url": "https://www.apoia.com.br/es/cursos/cursos-de-petroleo-y-gas-es/lista/?utm_source=chatgpt.com"
    }
  ];

  // Mostrar cursos en el HTML
  cursos.forEach(curso => {
    const div = document.createElement("div");
    div.className = "curso-card";
    div.innerHTML = `
      <h3>${curso.nombre} (${curso.nivel})</h3>
      <p>${curso.descripcion}</p>
      <a href="${curso.url}" target="_blank">🔗 Ir al curso</a>
    `;
    lista.appendChild(div);
  });

  mensaje.textContent = "Estos son los cursos disponibles:";
});

function volverAlMenu() {
  window.location.href = "../menu/menu.html";
}
