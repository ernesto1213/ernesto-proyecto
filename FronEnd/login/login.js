document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const loginData = { email, password };
    console.log("📦 Datos enviados (login):", loginData);

    try {
      // Llamada directa al backend usando fetch
      const response = await fetch("https://nuevo-production-e70c.up.railway.app/api/login/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      // Intentar parsear la respuesta JSON
      const data = await response.json();

      const userId = data.id;
      const token = data.token;
      const rango = data.rango;
localStorage.setItem('userId', userId); // clave exacta
localStorage.setItem('token', token);
localStorage.setItem('rango', rango);
      console.log("📩 Respuesta login:", data);

      if (response.ok && data.status === "ok") {
        localStorage.setItem("token", data.token);
window.location.href = "../menu/menu.html"; // desde login.html
      } else {
        alert("❌ " + (data.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("🚨 Error al hacer login:", error);
      alert("❌ Error de conexión con el servidor");
    }
  });
});
