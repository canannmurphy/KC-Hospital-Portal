import { getState, setState, resetState } from "../state";
import { previousAddView } from "./newPatientState";
import { hideProcessBtns } from "./processPatientState";

const removePatientBtn = document.getElementById("removeGroupBtn");
const cancelRemoveBtn = document.getElementById("cancelRemoval");
const removeBtn = document.getElementById("removeCurrent");

const searchView = document.getElementById("searchView");
const addView = document.getElementById("addView");

removePatientBtn.addEventListener("click", () => {
  const currentActive = getState();
  if (currentActive === "removePatient") return;

  if (currentActive === "coordView") {
    showRemoveBtns();
  } else if (currentActive === "newPatient") {
    addView.classList.add("hide");
    previousAddView();
    document.getElementById("coordView").classList.remove("hide");
    showRemoveBtns();
  } else if (currentActive === "searchPatient") {
    searchView.classList.add("hide");
    document.getElementById("coordView").classList.remove("hide");
    clearSearchResults();
    showRemoveBtns();
  } else if (currentActive === "processPatient") {
    hideProcessBtns();
    showRemoveBtns();
  }

  setState("removePatient");
});

export function initRemovePatientBtn(socket, name) {
  removeBtn.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    const msg = {
      type: "removeCurrent",
      name: name,
    };
    socket.send(JSON.stringify(msg));
    hideRemoveBtns();
    setState("coordView");
  });
}

cancelRemoveBtn.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("cancelled");
  hideRemoveBtns();
  setState("coordView");
});

function showRemoveBtns() {
  cancelRemoveBtn.classList.remove("hide");
  removeBtn.classList.remove("hide");
}

export function hideRemoveBtns() {
  cancelRemoveBtn.classList.add("hide");
  removeBtn.classList.add("hide");
}
