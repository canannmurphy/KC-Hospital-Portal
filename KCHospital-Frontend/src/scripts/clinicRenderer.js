export function renderClinicBatch(clinicName, patients) {
  const container = document.getElementById(`clinic${clinicName}`);
  if (!container) return;

  container.innerHTML = ""; // clear current view

  patients.forEach((patient) => {
    const group = document.createElement("div");
    group.classList.add("patientGroup");
    group.id = `${patient.id}`;

    const nameEl = document.createElement("p");
    nameEl.classList.add("patientName");
    nameEl.textContent = `${patient.name}`;
    if (patient.isCritical === true) {
      nameEl.classList.add("criticalPatient");
    }

    const coordEl = document.createElement("p");
    coordEl.classList.add("patientCoordinator");
    coordEl.textContent = patient.coordinator || "_";

    group.appendChild(nameEl);
    group.appendChild(coordEl);
    container.appendChild(group);
  });
}

export function handleBatchMessage(msg) {
  const clinic = msg.clinic;
  const patients = msg.patients;
  renderClinicBatch(clinic, patients);
}

export function updatePatientCard(patientID, coordinatorName) {
  const card = document.getElementById(patientID);
  if (card) {
    const coordinatorElem = card.querySelector(".patientCoordinator");
    if (coordinatorElem) {
      coordinatorElem.textContent = coordinatorName || "-";
    }
  }
}

export function handleSearchResults(msg) {
  const socialGroup = document.getElementById("socialGroup");
  const nameGroup = document.getElementById("nameGroup");
  const clinicGroup = document.getElementById("clinicGroup");
  const criticalGroup = document.getElementById("criticalGroup");

  document.querySelectorAll(".value").forEach((el) => el.remove());

  let count = 0;
  msg.patients.forEach((p) => {
    const createValue = (text, parent) => {
      const el = document.createElement("p");
      if (p.critical) {
        el.classList.add("criticalPatient");
      }
      el.classList.add("value");
      el.textContent = text;
      parent.appendChild(el);
    };

    createValue(`${p.firstName} ${p.lastName}`, nameGroup);
    createValue(p.ssn, socialGroup);
    createValue(p.clinic, clinicGroup);
    createValue(p.critical ? "YES" : "NO", criticalGroup);
    count++;
  });

  document.getElementById("count").textContent = count;
}
