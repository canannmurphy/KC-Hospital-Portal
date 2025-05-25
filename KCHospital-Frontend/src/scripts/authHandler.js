export function validateSession() {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    window.location.href = "index.html";
    return null;
  }

  const name = token.split(" ")[1]?.split(":")[0] || "Guest";
  document.getElementById("welcome").textContent = `Hi, ${name}`;
  return name;
}

export function setupLogout(socket) {
  const logoutBtn = document.querySelector("#logoutBtn");
  logoutBtn.addEventListener("click", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "logout", name: validateSession() }));
      setTimeout(() => socket.close(), 100);  // Ensure logout message is sent
    }

    sessionStorage.removeItem("authToken");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 120);  // Delay navigation slightly to allow cleanup
  });
}
