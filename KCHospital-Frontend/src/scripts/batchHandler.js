export function initBatchCycling(socket, name) {
  // Maintain batch index for each clinic
  const batchIndex = {
    Heart: 1,
    Pulmonary: 1,
    Plastic: 1,
  };

  // Helper to request a batch for a clinic
  function requestBatch(clinic) {
    socket.send(
      JSON.stringify({
        type: "requestBatch",
        clinic,
        batch: batchIndex[clinic],
        name,
      })
    );
  }

  // Heart clinic - next/prev
  document.getElementById("nextHeartBtn").addEventListener("click", () => {
    if (batchIndex.Heart < 2) {
      batchIndex.Heart++;
      requestBatch("Heart");
    }
  });
  document.getElementById("prevHeartBtn").addEventListener("click", () => {
    if (batchIndex.Heart > 1) batchIndex.Heart--;
    requestBatch("Heart");
  });

  // Pulmonary clinic - next/prev
  document.getElementById("nextPulBtn").addEventListener("click", () => {
    if (batchIndex.Pulmonary < 2) {
      batchIndex.Pulmonary++;
      requestBatch("Pulmonary");
    }
  });
  document.getElementById("prevPulBtn").addEventListener("click", () => {
    if (batchIndex.Pulmonary > 1) batchIndex.Pulmonary--;
    requestBatch("Pulmonary");
  });

  // Plastic clinic - next/prev
  document.getElementById("nextPlasBtn").addEventListener("click", () => {
    if (batchIndex.Plastic < 2) {
      batchIndex.Plastic++;
      requestBatch("Plastic");
    }
  });
  document.getElementById("prevPlasBtn").addEventListener("click", () => {
    if (batchIndex.Plastic > 1) batchIndex.Plastic--;
    requestBatch("Plastic");
  });
}