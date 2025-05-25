const appState = {
  currentView: "coordView", //initial state
};

export function getState() {
  return appState.currentView;
}

export function setState(view) {
  appState.currentView = view;
}

export function resetState() {
  appState.currentView = "coordView";
}
