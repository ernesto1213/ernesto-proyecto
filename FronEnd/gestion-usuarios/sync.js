// sync.js
// Sincronizador simple: procesa pendingOps en IndexedDB cuando hay conexión.
// Asegúrate de definir BASE_URL correctamente.

const BASE_URL = "http://localhost:8080"; // <- ajusta si tu API está en otro host/puerto

// Procesa una operación pendiente
async function processOp(op) {
  // op = { id, type, store, item: {...}, timestamp }
  try {
    if (op.store === "usuarios") {
      const item = op.item;
      if (op.type === "update") {
        // usa PUT /api/login/{id}
        const res = await fetch(`${BASE_URL}/api/login/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error("PUT usuarios falló");
      } else if (op.type === "create") {
        const res = await fetch(`${BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error("POST usuarios falló");
      } else if (op.type === "delete") {
        const res = await fetch(`${BASE_URL}/api/login/${item.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("DELETE usuarios falló");
      }
    }

    // Ejemplos para otros stores (examenes, respuestas, certificados).
    // Ajusta las rutas si tu backend difiere.
    if (op.store === "respuestas") {
      const item = op.item;
      if (op.type === "create") {
        const res = await fetch(`${BASE_URL}/api/respuestas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error("POST respuestas falló");
      }
    }

    if (op.store === "examenes") {
      const item = op.item;
      if (op.type === "create") {
        const res = await fetch(`${BASE_URL}/api/examenes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error("POST examenes falló");
      } else if (op.type === "update") {
        const res = await fetch(`${BASE_URL}/api/examenes/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error("PUT examenes falló");
      }
    }

    if (op.store === "certificados") {
      const item = op.item;
      if (op.type === "create") {
        const res = await fetch(`${BASE_URL}/api/certificados`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error("POST certificados falló");
      }
    }

    // Si llegamos aquí, la operación fue exitosa en el servidor:
    await window.localDB.deletePendingOp(op.id);
    console.log("Op sincronizada y eliminada localmente:", op);
    return true;
  } catch (err) {
    console.error("Error sincronizando op", op, err);
    return false;
  }
}

// Procesa todas las ops
async function syncAllPendingOps() {
  if (!navigator.onLine) return;
  const ops = await window.localDB.getAllPendingOps();
  console.log("Ops pendientes a procesar:", ops.length);
  for (const op of ops) {
    await processOp(op);
    // no forcemos demasiadas peticiones simultáneas; el await ayuda a ordenarlas.
  }
}

// Detecta cuando vuelve la conexión
window.addEventListener("online", () => {
  console.log("→ Online: intentando sincronizar ops pendientes...");
  syncAllPendingOps().then(() => {
    console.log("Sincronización completa (intento).");
    // opcional: recargar vista o emitir evento
    document.dispatchEvent(new Event("sync:done"));
  });
});

// También intenta sincronizar al cargar si ya está online
window.addEventListener("load", () => {
  if (navigator.onLine) {
    syncAllPendingOps();
  }
});

// Export simple
window.syncService = { syncAllPendingOps };
