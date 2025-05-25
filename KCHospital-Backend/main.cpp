#include <crow.h>
#include "middlewares/authMiddleware.h"
#include "middlewares/corsMiddleware.h"
#include "clinic/transactionLogger.h"
#include "routes/loginRoute.h"
#include "server.h"
#include "clinic/initClinics.h"

int main() {

    ClinicManager clinicManager = initializeClinics();

    crow::App<AUTH, CORS> app;
    defineLoginRoute(app);
    defineWebSocketRoute(app, clinicManager);
    defineDownloadRoute(app);

    app.bindaddr("0.0.0.0").port(18080).run();

    // Create patients
    // Patient* p1 = new Patient("Alice", "Smith", "001", false);
    // p1->status = Assigned;
    // p1->assignedCoordinator = "Leo";

    // Patient* p2 = new Patient("Bob", "Jones", "002", true);
    // p2->status = Assigned;
    // p2->assignedCoordinator = "Jane";

    // // Add to Heart clinic
    // clinicManager.addPatientTo("Heart", p1, "Leo");
    // clinicManager.addPatientTo("Heart", p2, "Jane");

    // // Track coordinator-patient assignments
    // clinicManager.trackAssignment("Leo", p1);
    // clinicManager.trackAssignment("Jane", p2);

    // std::cout << "Before removal:" << std::endl;
    // clinicManager.printClinicPatients("Heart", cout);

    // // Remove p1
    // std::cout << "\nAttempting to remove Alice (Leo):" << std::endl;
    // clinicManager.cancelAssignedPatient("Leo");

    // std::cout << "\nAfter removal:" << std::endl;
    // clinicManager.printClinicPatients("Heart", cout);

    // //Process bob here
    // std::cout << "\nAttempting to process Bob (Jane):" << std::endl;
    // clinicManager.processAssignedPatient("Jane");

    // std::cout << "\nAfter processing Bob:" << std::endl;
    // clinicManager.printClinicPatients("Heart", cout);
    
    return 0;
}