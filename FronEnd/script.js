// ✅ Detectar si el usuario ya inició sesión
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Si hay token, redirigir directamente al menú
  if (token) {
    console.log("🔑 Usuario ya logueado, redirigiendo al menú...");
    window.location.href = "menu/menu.html";
    return; // Detiene el resto del script
  }

  // Si no hay token, se muestra la pantalla de inicio
  document.getElementById("loginBtn").addEventListener("click", () => {
    window.location.href = "login/login.html"; // redirige al login
  });

  document.getElementById("registerBtn").addEventListener("click", () => {
    window.location.href = "register/register.html"; // redirige al registro
  });

  document.getElementById("verServicios").addEventListener("click", () => {
    document.getElementById("servicios").scrollIntoView({ behavior: "smooth" });
  });
});
