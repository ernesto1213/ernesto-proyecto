// gestion-usuarios.js
// Asegúrate de que db.js y sync.js se carguen antes de este archivo.

const BASE_URL = "https://nuevo-production-e70c.up.railway.app"; // Cambia si tu API está en otro host o puerto
const API_SIN_RANGO = `${BASE_URL}/api/login/sin-rango`;
const API_USER_PUT = (id) => `${BASE_URL}/api/login/${id}`;

const statusDiv = document.getElementById("status");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const tabla = document.getElementById("tablaUsuarios");
const tablaBody = document.getElementById("tablaBody");

// 🟢 Actualiza estado de conexión visualmente
function updateConnectionStatus() {
  if (navigator.onLine) {
    statusDiv.textContent = "🟢 En línea";
    statusDiv.style.color = "green";
  } else {
    statusDiv.textContent = "🟠 Sin conexión — trabajando localmente";
    statusDiv.style.color = "orange";
  }
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
updateConnectionStatus();

// 🧩 Carga usuarios desde API
async function cargarUsuariosDesdeAPI() {
  const res = await fetch(API_SIN_RANGO);
  if (!res.ok) throw new Error("Error al obtener usuarios desde API");
  return res.json();
}

// 🔁 Carga general (desde API o IndexedDB)
async function cargarUsuarios() {
  loading.style.display = "block";
  errorDiv.style.display = "none";
  tabla.style.display = "none";
  tablaBody.innerHTML = "";

  try {
    let usuarios = [];

    if (navigator.onLine) {
      try {
        usuarios = await cargarUsuariosDesdeAPI();

        // Guarda los usuarios del servidor en la base local
        for (const u of usuarios) {
          await window.localDB.putUsuarioLocal(u);
        }
      } catch (err) {
        console.warn("⚠️ Error cargando desde API, usando cache local:", err);
        usuarios = await window.localDB.getAllUsuariosLocal();
      }
    } else {
      usuarios = await window.localDB.getAllUsuariosLocal();
    }

    loading.style.display = "none";

    if (!usuarios || usuarios.length === 0) {
      errorDiv.style.display = "block";
      errorDiv.textContent = "⚠️ No hay usuarios (ni en cache ni en servidor).";
      return;
    }

    // Muestra la tabla
    tabla.style.display = "table";

    usuarios.forEach(u => {
      const fila = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = u.id;
      tdId.setAttribute("data-label", "ID");

      const tdNombre = document.createElement("td");
      tdNombre.textContent = u.name || "";
      tdNombre.contentEditable = "true";
      tdNombre.setAttribute("data-label", "Nombre");

      const tdEmail = document.createElement("td");
      tdEmail.textContent = u.email || "";
      tdEmail.contentEditable = "true";
      tdEmail.setAttribute("data-label", "Email");

      const tdPassword = document.createElement("td");
      tdPassword.textContent = u.password || "";
      tdPassword.contentEditable = "true";
      tdPassword.setAttribute("data-label", "Password");

      const tdRango = document.createElement("td");
      tdRango.textContent = u.rango ?? "Sin rango";
      tdRango.contentEditable = "true";
      tdRango.setAttribute("data-label", "Rango");

      const tdAccion = document.createElement("td");
      const btnGuardar = document.createElement("button");
      btnGuardar.textContent = "💾 Guardar";
      btnGuardar.className = "guardar";
      tdAccion.appendChild(btnGuardar);

      fila.appendChild(tdId);
      fila.appendChild(tdNombre);
      fila.appendChild(tdEmail);
      fila.appendChild(tdPassword);
      fila.appendChild(tdRango);
      fila.appendChild(tdAccion);

      // 💾 Botón Guardar
      btnGuardar.addEventListener("click", async () => {
        const updated = {
          id: u.id,
          name: tdNombre.textContent.trim(),
          email: tdEmail.textContent.trim(),
          password: tdPassword.textContent.trim(),
          rango:
            tdRango.textContent.trim().toLowerCase() === "sin rango" ||
            tdRango.textContent.trim() === ""
              ? null
              : tdRango.textContent.trim(),
        };

        // Guarda en IndexedDB
        await window.localDB.putUsuarioLocal(updated);

        if (navigator.onLine) {
          try {
            const res = await fetch(API_USER_PUT(u.id), {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updated),
            });

            if (!res.ok) throw new Error("Fallo al actualizar en servidor");

            alert("✅ Usuario actualizado correctamente en servidor");
            await window.syncService.syncAllPendingOps();
          } catch (err) {
            console.warn("⚠️ Error al sincronizar, guardando localmente", err);
            await window.localDB.addPendingOp({
              type: "update",
              store: "usuarios",
              item: updated,
            });
            alert("💾 Guardado localmente (sincronizará más tarde).");
          }
        } else {
          await window.localDB.addPendingOp({
            type: "update",
            store: "usuarios",
            item: updated,
          });
          alert("💾 Sin conexión: cambios guardados localmente.");
        }
      });

      tablaBody.appendChild(fila);
    });
  } catch (err) {
    loading.style.display = "none";
    errorDiv.style.display = "block";
    errorDiv.textContent = "Error: " + err.message;
    console.error(err);
  }
}

// 🔁 Escucha evento de sincronización completa
document.addEventListener("sync:done", () => {
  if (navigator.onLine) {
    cargarUsuarios();
  }
});

// 🚀 Carga inicial
cargarUsuarios();

// ⚡ NUEVO: sincronización automática cuando vuelve el Internet
window.addEventListener("online", async () => {
  console.log("🔄 Conexión restaurada. Intentando sincronizar datos pendientes...");

  const pendingOps = await window.localDB.getAllPendingOps(); // ← función que ya tienes en db.js

  for (const op of pendingOps) {
    if (op.type === "update" && op.store === "usuarios") {
      try {
        const res = await fetch(API_USER_PUT(op.item.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.item),
        });

        if (res.ok) {
          console.log(`✅ Usuario ${op.item.id} sincronizado correctamente`);
          await window.localDB.removePendingOp(op.id); // elimina la operación sincronizada
        } else {
          console.warn(`⚠️ Falló sincronización para usuario ${op.item.id}`);
        }
      } catch (error) {
        console.error("❌ Error al sincronizar:", error);
      }
    }
  }

  console.log("✅ Sincronización automática completada");
  await cargarUsuarios(); // refresca la lista con datos actualizados
});
function logout() {
  localStorage.clear();
  window.location.href = "../../index.html";
}