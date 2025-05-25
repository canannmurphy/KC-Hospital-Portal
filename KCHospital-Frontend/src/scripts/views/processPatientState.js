import { getState, setState, resetState } from "../state";
import { previousAddView } from "./newPatientState";
import { hideRemoveBtns } from "./removePatientState";
import { clearSearchResults } from "./searchPatientState";

const processPatientBtn = document.getElementById("processGroupBtn");
const cancelProcessBtn = document.getElementById("cancelProcessing");
const processBtn = document.getElementById("processCurrent");

const searchView = document.getElementById("searchView");
const addView = document.getElementById("addView");

processPatientBtn.addEventListener("click", () => {
  const currentActive = getState();
  if (currentActive === "processPatient") return;

  if (currentActive === "coordView") {
    showProcessBtns();
  } else if (currentActive === "newPatient") {
    addView.classList.add("hide");
    previousAddView();
    document.getElementById("coordView").classList.remove("hide");
    showProcessBtns();
  } else if (currentActive === "searchPatient") {
    searchView.classList.add("hide");
    clearSearchResults();
    document.getElementById("coordView").classList.remove("hide");
    showProcessBtns();
  } else if (currentActive === "removePatient") {
    hideRemoveBtns();
    showProcessBtns();
  }

  setState("processPatient");
});


export function initProcessPatientBtn(socket, name) {
  processBtn.addEventListener("click", (e) => {
    e.stopImmediatePropagation();
    const msg = {
      type: "processCurrent",
      name: name,
    };
    socket.send(JSON.stringify(msg));
    hideProcessBtns();
    setState("coordView");
  });
}

cancelProcessBtn.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("cancelled");
  hideProcessBtns();
  setState("coordView");
});

function showProcessBtns() {
  cancelProcessBtn.classList.remove("hide");
  processBtn.classList.remove("hide");
}

export function hideProcessBtns() {
  cancelProcessBtn.classList.add("hide");
  processBtn.classList.add("hide");
}
