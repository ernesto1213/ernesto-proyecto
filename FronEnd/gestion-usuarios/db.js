// db.js
// Usa Dexie para simplificar IndexedDB.
// Asegúrate de que Dexie esté cargado antes (en el HTML incluimos la CDN).

const DB_NAME = "miAppDB_v1";
const db = new Dexie(DB_NAME);

db.version(1).stores({
  // keyPath se alinea con tus ids de backend.
  usuarios: "id, name, email, rango",         // guardar usuarios completos
  examenes: "id, titulo, fechaCreacion",      // exámenes creados
  respuestas: "++id, examenId, usuarioId",    // respuestas (autoIncrement para pendientes)
  certificados: "id, usuarioId, url",         // metadatos o url del certificado
  // Cola de operaciones pendientes: cada item describe una acción que se intentará en el servidor
  pendingOps: "++id, type, store, itemId, timestamp"
});

// Helpers convenientes
async function putUsuarioLocal(usuario) {
  await db.usuarios.put(usuario);
}

async function getAllUsuariosLocal() {
  return db.usuarios.toArray();
}

async function addPendingOp(op) {
  // op: { type: "update"|"create"|"delete", store: "usuarios"/"respuestas"/..., item: {...} }
  await db.pendingOps.add({ ...op, timestamp: Date.now() });
}

async function getAllPendingOps() {
  return db.pendingOps.toArray();
}

async function deletePendingOp(id) {
  return db.pendingOps.delete(id);
}

// Exporta en window para que otros scripts puedan usarlo sin módulos
window.localDB = {
  db,
  putUsuarioLocal,
  getAllUsuariosLocal,
  addPendingOp,
  getAllPendingOps,
  deletePendingOp
};
