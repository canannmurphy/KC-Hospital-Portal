import { handleBatchMessage, updatePatientCard } from "./clinicRenderer.js";
import { patientAdded, submitIcons } from "./views/newPatientState.js";
import { handleSearchResults } from "./clinicRenderer.js";

export function initializeWebSocket(name) {
  const socket = new WebSocket(`ws://${window.location.hostname}:18080/ws`);

  function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ ...message, name }));
    }
  }

  socket.addEventListener("open", () => {
    sendMessage({ type: "identify" });
    ["Heart", "Pulmonary", "Plastic"].forEach((clinic) => {
      sendMessage({ type: "requestBatch", clinic, batch: 1 });
    });
  });

  socket.addEventListener("message", (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "forceLogout") {
        // alert(msg.reason || "You have been logged out.");
        sessionStorage.clear();
        window.location.href = "/index.html";
        return;
      }

      if (msg.type === "assignment") {
        const fullName = msg.name;
        const clinicName = msg.clinicName;

        document.getElementById("assignedPatient").textContent = fullName;
        document.getElementById("assignedPatientClinic").textContent = `${clinicName} Clinic`;
      }

      if (msg.type === "batch") {
        handleBatchMessage(msg);
      }

      if (msg.type === "patientAssignment" || msg.type === "patientUnassigned") {
        updatePatientCard(msg.patientID, msg.coordinator);
      }

      if (msg.type === "patientResponse") {
        if (msg.text === "patient added") {
          submitIcons[2].classList.remove("hide");
          document.getElementById("addResponseLabel").textContent = msg.text;
          setTimeout(() => {
            submitIcons[2].classList.add("hide");
            submitIcons[0].classList.remove("hide");
            document.getElementById("addResponseLabel").textContent = "";
            patientAdded();
          }, 800);
        } else {
          document.getElementById("addResponseLabel").textContent = msg.text;
          submitIcons[0].classList.remove("hide");
          setTimeout(() => {
            submitIcons[0].classList.add("hide");
            submitIcons[1].classList.remove("hide");
            document.getElementById("addResponseLabel").textContent = "";
          }, 800);
        }
      }

      if (msg.type === "batchUpdate") {
        handleBatchMessage(msg);
      }

      if (msg.type === "clinicCapacities") {
        ["Heart", "Pulmonary", "Plastic"].forEach((clinic) => {
          const button = document.querySelector(`.clinicBtn[data-clinic="${clinic}"]`);
          if (button) {
            if (msg[clinic] >= 18) {
              button.disabled = true;
            } else {
              button.disabled = false;
            }
          }
        });
      }

      if (msg.type === "searchResults") {
        handleSearchResults(msg);
      }

      //update batch here
    } catch (err) {
      console.log("Non-JSON message:", event.data);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (socket.readyState === WebSocket.OPEN) {
      sendMessage({ type: "disconnect" });
    }
  });

  return socket;
}
