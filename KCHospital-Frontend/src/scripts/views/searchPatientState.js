import { getState, setState, resetState } from "../state";
import { previousAddView } from "./newPatientState";
import { hideProcessBtns } from "./processPatientState";
import { hideRemoveBtns } from "./removePatientState";

const searchPatientBtn = document.getElementById("searchPatientBtn");
const closeSearchViewBtn = document.getElementById("closeSearchView");

const searchView = document.getElementById("searchView");
const addView = document.getElementById("addView");

searchPatientBtn.addEventListener("click", () => {
  const currentActive = getState();
  if (currentActive === "searchPatient") return;

  if (currentActive === "coordView") {
    document.getElementById("coordView").classList.add("hide");
    searchView.classList.remove("hide");
    clearSearchResults();
  } else if (currentActive === "newPatient") {
    addView.classList.add("hide");
    previousAddView();
    searchView.classList.remove("hide");
    clearSearchResults();
  } else if (currentActive === "processPatient") {
    document.getElementById("coordView").classList.add("hide");
    searchView.classList.remove("hide");
    hideProcessBtns();
  } else if (currentActive === "removePatient") {
    document.getElementById("coordView").classList.add("hide");
    searchView.classList.remove("hide");
    hideRemoveBtns();
  }
  document.getElementById("searchView").classList.remove("hide");
  setState("searchPatient");
});

closeSearchViewBtn.addEventListener("click", () => {
  searchView.classList.add("hide");
  clearSearchResults();
  document.getElementById("coordView").classList.remove("hide");
  setState("coordView");
});

const inputFirstName = document.getElementById("searchFirst");
const inputLastName = document.getElementById("searchLast");

let firstValid = false;
let lastValid = false;

export function clearSearchResults() {
  document.querySelectorAll(".value").forEach((el) => el.remove());
  document.getElementById("count").textContent = 0;
}

inputFirstName.addEventListener("input", () => {
  inputFirstName.value = inputFirstName.value.replace(/[^a-zA-Z]/g, "");
  if (inputFirstName.value && firstValid === false) {
    clearSearchResults();
    firstValid = true;
  }
});

inputLastName.addEventListener("input", () => {
  inputLastName.value = inputLastName.value.replace(/[^a-zA-Z]/g, "");
  if (inputLastName.value && lastValid === false) {
    clearSearchResults();
    lastValid = true;
  }
});

export function initSearchBtn(socket, name) {
  searchBtn.addEventListener("click", () => {
    const first = inputFirstName.value.trim().replace(/^([a-zA-Z])/, (_, c) => c.toUpperCase());
    const last = inputLastName.value.trim().replace(/^([a-zA-Z])/, (_, c) => c.toUpperCase());
    if (first.length === 0 || last.length === 0) return;

    socket.send(
      JSON.stringify({
        type: "searchPatient",
        firstName: first,
        lastName: last,
        name: name,
      })
    );
    lastValid = false;
    firstValid = false;

    inputFirstName.value = "";
    inputLastName.value = "";
  });
}
