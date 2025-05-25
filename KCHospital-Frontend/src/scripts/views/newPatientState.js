import { getState, setState, resetState } from "../state";
import { hideProcessBtns } from "./processPatientState";
import { hideRemoveBtns } from "./removePatientState";
import { clearSearchResults } from "./searchPatientState";

let patient = {};
const newPatientBtn = document.getElementById("newPatientBtn");

const addView = document.getElementById("addView");
const addView1 = document.getElementById("addView1");

export function patientAdded() {
  resetAddForm();
  addView.classList.add("hide");
  document.getElementById("coordView").classList.remove("hide");
  setState("coordView");
}

export function initNewPatientBtn(socket, name) {
  newPatientBtn.addEventListener("click", () => {
    //Run capcity check here
    socket.send(JSON.stringify({ type: "currentCapacity", name: name }));

    const currentActive = getState();
    if (currentActive === "newPatient") return;

    if (currentActive === "coordView") {
      document.getElementById("coordView").classList.add("hide");
      addView.classList.remove("hide");
      previousAddView();
    } else if (currentActive === "searchPatient") {
      document.getElementById("searchView").classList.add("hide");
      addView.classList.remove("hide");
      previousAddView();
    } else if (currentActive === "processPatient") {
      document.getElementById("coordView").classList.add("hide");
      addView.classList.remove("hide");
      previousAddView();
      hideProcessBtns();
    } else if (currentActive === "removePatient") {
      document.getElementById("coordView").classList.add("hide");
      addView.classList.remove("hide");
      previousAddView();
      hideRemoveBtns();
    }

    setState("newPatient");
  });
}

const clinicBtns = document.querySelectorAll(".clinicBtn");
const addView2 = document.getElementById("addView2");
let selectedClinic = null;
const returnPrevAddView = document.getElementById("returnPrevAddView");
const inputFields = addView2.querySelectorAll("input");

function nextAddView() {
  addView1.classList.add("hide");
  addView2.classList.remove("hide");
  returnPrevAddView.classList.remove("off");
}

export function previousAddView() {
  addView2.classList.add("hide");
  addView1.classList.remove("hide");
  returnPrevAddView.classList.add("off");
  resetAddForm();
}

clinicBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedClinic = btn.innerHTML;
    nextAddView();
  });
});

returnPrevAddView.addEventListener("click", () => {
  previousAddView();
});

const criticalBtn = document.getElementById("criticalBtn");

let isCritical = false;
criticalBtn.addEventListener("click", () => {
  isCritical = !isCritical;
  criticalBtn.classList.toggle("isCritical", isCritical);
});

function resetAddForm() {
  inputFields.forEach((field) => (field.value = ""));
  isCritical = false;
  criticalBtn.classList.remove("isCritical");
  selectedClinic = null;
  updateSubmitBtnIcon();
  document.getElementById("addResponseLabel").textContent = "";
}

const closeAddView = document.getElementById("closeAddView");

closeAddView.addEventListener("click", () => {
  addView.classList.add("hide");
  document.getElementById("coordView").classList.remove("hide");
  setState("coordView");
  previousAddView();
});

const submitBtn = document.getElementById("submitNewPatientBtn");
export const submitIcons = submitBtn.querySelectorAll(".addPatientIcon");

function updateSubmitBtnIcon() {
  const allFilled = Array.from(inputFields).every((input) => input.value.trim() !== "");

  const ssnValid = /^\d{3}$/.test(inputFields[2].value.trim());

  if (allFilled && ssnValid) {
    submitIcons[0].classList.add("hide"); // minus
    submitIcons[1].classList.remove("hide"); // plus
  } else {
    submitIcons[0].classList.remove("hide");
    submitIcons[1].classList.add("hide");
    submitIcons[2].classList.add("hide");
  }
}

// Enforce alphabet-only for first and last name fields
inputFields[0].addEventListener("input", () => {
  inputFields[0].value = inputFields[0].value.replace(/[^a-zA-Z]/g, "");
});
inputFields[1].addEventListener("input", () => {
  inputFields[1].value = inputFields[1].value.replace(/[^a-zA-Z]/g, "");
});

// Enforce SSN input field to accept only numeric characters and max 3 chars
const ssnField = inputFields[2];
ssnField.setAttribute("maxlength", "3");

ssnField.addEventListener("input", () => {
  ssnField.value = ssnField.value.replace(/\D/g, "").slice(0, 3);
});

inputFields.forEach((input) => {
  input.addEventListener("input", updateSubmitBtnIcon);
});

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function initAddPatient(socket, name) {
  submitIcons[1].addEventListener("click", (e) => {
    e.stopPropagation();
    submitIcons[1].classList.add("hide");
    // submitIcons[2].classList.remove("hide"); // check

    // Capture patient data
    patient = {
      firstName: capitalizeFirst(inputFields[0].value.trim()),
      lastName: capitalizeFirst(inputFields[1].value.trim()),
      ssn: inputFields[2].value.trim(),
      critical: isCritical,
      clinic: selectedClinic,
    };
    socket.send(JSON.stringify({ type: "addPatient", patient: patient, name: name }));
  });
}
