// Get references to the input fields
const nameInput = document.getElementById("coordinator");
const codeInput = document.getElementById("passcode");

// Ensure the passcode field only accepts up to 3 digits
codeInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
});

// Handle login logic when the passcode input changes
codeInput.addEventListener("input", async () => {
  // Capitalize first letter of each word in name input
  const name = nameInput.value.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  const code = codeInput.value.trim();

  // Proceed only if 3-digit code is entered and name is not empty
  if (code.length === 3 && name) {
    const host = window.location.hostname;

    // Temporarily disable inputs to prevent multiple submissions
    nameInput.disabled = true;
    codeInput.disabled = true;

    // Send POST request to login route
    const res = await fetch(`http://${host}:18080/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });

    // Re-enable inputs regardless of login success
    nameInput.disabled = false;
    codeInput.disabled = false;

    if (res.ok) {
      // Save auth token in sessionStorage for future use
      sessionStorage.setItem("authToken", `Bearer ${name}:${code}`);

      // Redirect to the portal on successful login
      window.location.href = "portal.html";
    } else {
      // Show error and reset code input on failure
      alert("Invalid login");
      codeInput.value = "";
    }
  }
});
