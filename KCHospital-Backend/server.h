#pragma once
#include "clinic/ClinicManager.h"
#include <crow.h>
#include <crow/websocket.h>
#include "websocketRegistry.h"
#include <unordered_set>

// Define WebSocket route for coordinator presence and communication
inline void defineWebSocketRoute(crow::App<AUTH, CORS>& app, ClinicManager& clinicManager) {
    // This function defines the WebSocket route for real-time communication between coordinators and the server
    static std::unordered_set<crow::websocket::connection*> activeConnections;
    static std::unordered_map<crow::websocket::connection*, Patient*> connectionToPatient;
    
    CROW_WEBSOCKET_ROUTE(app, "/ws")
    .onopen([](crow::websocket::connection& conn) {
        // When a new WebSocket connection is opened, add it to the set of active connections
        CROW_LOG_INFO << "New WebSocket connection accepted.";
        activeConnections.insert(&conn);
    })
    .onmessage([&clinicManager](crow::websocket::connection& conn, const std::string& message, bool is_binary) {
    
        // Parse incoming WebSocket message and handle different types
        crow::json::rvalue json;
        try {
   
            json = crow::json::load(message);
            CROW_LOG_INFO << "Raw message received: " << message;
            if(!json) {
                CROW_LOG_WARNING << "Received invalid JSON message.";
                return;
            }
            std::string type = json["type"].s();
            std::string name = json["name"].s();
            CROW_LOG_INFO << "Received message: type = " << type << ", name = " << name;

            if (type == "logout") {
                // Handle logout request: release assigned patient and broadcast update to others
                CROW_LOG_INFO << "Triggered logout event for: " << name;

                if (connectionToPatient.count(&conn)) {
                    Patient* p = connectionToPatient[&conn];
                    p->status = Unassigned;
                    p->assignedCoordinator.clear();

                    crow::json::wvalue broadcastMsg;
                    broadcastMsg["type"] = "patientUnassigned";
                    broadcastMsg["patientID"] = p->patientID;
                    broadcastMsg["coordinator"] = "";

                    for (auto* c : activeConnections) {
                        if (c != &conn) {
                            c->send_text(broadcastMsg.dump());
                        }
                    }

                    connectionToPatient.erase(&conn);
                    CROW_LOG_INFO << "Released patient " << p->patientID << " from " << name;
                }

                conn.close("Logout complete");
            }
            
            if (type == "identify") {
                // Handle coordinator identification: assign a patient and notify others
                // First check if the same coordinator is already connected elsewhere
                // CROW_LOG_INFO << "Triggered identify event for: " << name;

                // Check if coordinator is already connected on another session
                for (auto it = connectionToPatient.begin(); it != connectionToPatient.end(); ++it) {
                    if (it->second->assignedCoordinator == name && it->first != &conn) {
                        crow::json::wvalue forcedLogout;
                        forcedLogout["type"] = "forceLogout";
                        forcedLogout["reason"] = "You have been signed out due to a login from another location.";
                        it->first->send_text(forcedLogout.dump());
                        break;
                    }
                }

                std::vector<std::string> clinicNames = {"Heart", "Pulmonary", "Plastic"};
                std::string selectedClinic = clinicNames[rand() % clinicNames.size()];
                Patient* patient = clinicManager.assignPatientFrom(selectedClinic, name);
        
                if (patient) {
                    // Save the mapping between the connection and assigned patient
                    connectionToPatient[&conn] = patient;
                    CROW_LOG_INFO << name << " assigned to patient " << patient->patientID;
                    // clinicManager.printClinicPatients(selectedClinic, cout);

                    // Send assignment details back to the client
                    crow::json::wvalue response;
                    response["type"] = "assignment";
                    response["patientID"] = patient->patientID;
                    response["name"] = patient->firstName +" "+ patient->lastName;
                    response["status"] = static_cast<int>(patient->status);
                    response["coordinator"] = patient->assignedCoordinator;
                    response["clinicName"] = selectedClinic;

                    conn.send_text(response.dump());

                    // Notify other active clients about the new assignment
                    crow::json::wvalue broadcastMsg;
                    broadcastMsg["type"] = "patientAssignment";
                    broadcastMsg["patientID"] = patient->patientID;
                    broadcastMsg["coordinator"] = patient->assignedCoordinator;

                    for (auto* c : activeConnections) {
                        if (c != &conn) {
                            c->send_text(broadcastMsg.dump());
                        }
                    }
                } else {
                    CROW_LOG_INFO << "No unassigned patients available for " << name;
                }

                for (auto* c : activeConnections) {
                    CROW_LOG_INFO << "Active connection: " << c;
                }
            }

            if (type == "requestBatch") {
                // Handle request for a batch of patients from a specific clinic
                // Return patient data in batches based on the requested index
                std::string clinic = json["clinic"].s();
                int batchNumber = json["batch"].i();

                auto patients = clinicManager.getClinicBatch(clinic, batchNumber);
                if (patients.empty()) {
                    CROW_LOG_INFO << "No patients found for clinic " << clinic << " batch " << batchNumber;
                    return;
                }
                crow::json::wvalue response;
                response["type"] = "batch";
                response["clinic"] = clinic;
                response["batch"] = batchNumber;

                response["patients"] = crow::json::wvalue::list();

                for (auto* patient : patients) {
                    crow::json::wvalue patientJson;
                    patientJson["id"] = patient->patientID;
                    patientJson["name"] = patient->firstName + " " + patient->lastName;
                    patientJson["status"] = static_cast<int>(patient->status);
                    patientJson["coordinator"] = patient->assignedCoordinator;
                    patientJson["isCritical"] = patient->isCritical;
                    response["patients"][response["patients"].size()] = std::move(patientJson);
                }

                conn.send_text(response.dump());
            }

            if (type == "addPatient") {
                // Handle new patient addition request
                CROW_LOG_INFO << "Received addPatient request from: " << name;

                crow::json::rvalue data = json["patient"];
                std::string first = data["firstName"].s();
                std::string last = data["lastName"].s();
                std::string clinic = data["clinic"].s();
                std::string ssn = data["ssn"].s();
                bool isCritical = data["critical"].b();

                bool added = clinicManager.addPatientTo(clinic, new Patient(first, last, ssn, isCritical), name);

                crow::json::wvalue patientResponse;
                patientResponse["type"] = "patientResponse";
                patientResponse["text"] = added ? "patient added" : "duplicated patient record!";
                conn.send_text(patientResponse.dump());

                if(added) {
                    int batchNumber = isCritical ? 1 : 3;
                    auto patients = clinicManager.getClinicBatch(clinic, 1);
                    crow::json::wvalue broadcastBatch;
                    broadcastBatch["type"] = "batchUpdate";
                    broadcastBatch["clinic"] = clinic;
                    broadcastBatch["batch"] = 0;
                    broadcastBatch["patients"] = crow::json::wvalue::list();
                    for (auto* patient : patients) {
                        crow::json::wvalue patientJson;
                        patientJson["id"] = patient->patientID;
                        patientJson["name"] = patient->firstName + " " + patient->lastName;
                        patientJson["status"] = static_cast<int>(patient->status);
                        patientJson["coordinator"] = patient->assignedCoordinator;
                        patientJson["isCritical"] = patient->isCritical;
                        broadcastBatch["patients"][broadcastBatch["patients"].size()] = std::move(patientJson);
                    }
                    for (auto* c : activeConnections) {
                        c->send_text(broadcastBatch.dump());
                    }
                }
         
            }

            if (type == "currentCapacity") {
                CROW_LOG_INFO << "Triggered currentCapacity request from: " << name;

                auto clinicSizes = clinicManager.getClinicSizes();
                crow::json::wvalue response;
                response["type"] = "clinicCapacities";
                for (const auto& [clinicName, size] : clinicSizes) {
                    response[clinicName] = size;
                }

                conn.send_text(response.dump());
            }

            if (type == "searchPatient") {
                std::string first = json["firstName"].s();
                std::string last = json["lastName"].s();

                CROW_LOG_INFO << "Triggered patient search for: " << first << " " << last;

                auto matchedPatients = clinicManager.searchPatients(first, last);

                crow::json::wvalue response;
                response["type"] = "searchResults";
                response["patients"] = crow::json::wvalue::list();

                for (const auto* p : matchedPatients) {
                    crow::json::wvalue patientJson;
                    patientJson["firstName"] = p->firstName;
                    patientJson["lastName"] = p->lastName;
                    patientJson["ssn"] = p->ssn;
                    patientJson["clinic"] = p->clinic;
                    patientJson["critical"] = p->isCritical;
                    response["patients"][response["patients"].size()] = std::move(patientJson);
                }

                conn.send_text(response.dump());
            }

            if (type == "removeCurrent" || type == "processCurrent") {
                if(type == "removeCurrent") CROW_LOG_INFO << name << " requested to remove their current patient.";
                if(type == "processCurrent")  CROW_LOG_INFO << name << " requested to process their current patient.";

                if (connectionToPatient.count(&conn)) {
                    Patient* assigned = connectionToPatient[&conn];
                    clinicManager.trackAssignment(name, assigned);
                    std::string clinic = assigned->clinic;

                    Patient* removed = type == "removeCurrent" ? clinicManager.cancelAssignedPatient(name) : clinicManager.processAssignedPatient(name);
                    if (removed) {
                        delete removed;
                    }

                    // clinicManager.printClinicPatients(clinic, cout);
                    connectionToPatient.erase(&conn);

                    // Broadcast patientUnassigned to others
                    auto patients = clinicManager.getClinicBatch(clinic, 1);
                    crow::json::wvalue broadcastBatch;
                    broadcastBatch["type"] = "batchUpdate";
                    broadcastBatch["clinic"] = clinic;
                    broadcastBatch["batch"] = 0;
                    broadcastBatch["patients"] = crow::json::wvalue::list();
                    for (auto* patient : patients) {
                        crow::json::wvalue patientJson;
                        patientJson["id"] = patient->patientID;
                        patientJson["name"] = patient->firstName + " " + patient->lastName;
                        patientJson["status"] = static_cast<int>(patient->status);
                        patientJson["coordinator"] = patient->assignedCoordinator;
                        patientJson["isCritical"] = patient->isCritical;
                        broadcastBatch["patients"][broadcastBatch["patients"].size()] = std::move(patientJson);
                    }
                    for (auto* c : activeConnections) {
                        c->send_text(broadcastBatch.dump());
                    }

                    // Assign a new patient to the same coordinator
                    std::vector<std::string> clinicNames = {"Heart", "Pulmonary", "Plastic"};
                    std::string selectedClinic = clinicNames[rand() % clinicNames.size()];
                    Patient* next = clinicManager.assignPatientFrom(selectedClinic, name);
                    if (next) {
                        connectionToPatient[&conn] = next;

                        crow::json::wvalue response;
                        response["type"] = "assignment";
                        response["patientID"] = next->patientID;
                        response["name"] = next->firstName + " " + next->lastName;
                        response["status"] = static_cast<int>(next->status);
                        response["coordinator"] = next->assignedCoordinator;
                        response["clinicName"] = selectedClinic;

                        conn.send_text(response.dump());

                        crow::json::wvalue broadcast;
                        broadcast["type"] = "patientAssignment";
                        broadcast["patientID"] = next->patientID;
                        broadcast["coordinator"] = next->assignedCoordinator;

                        for (auto* c : activeConnections) {
                            c->send_text(broadcast.dump());
                        }
                    }
                }
            }

            if (type == "disconnect") {
                // Handle disconnection due to page refresh or manual trigger
                // (handled more formally in .onclose)
                CROW_LOG_INFO << name << " disconnected (likely due to refresh).";
            }

        } catch (...) {
    
            return;
        }
    })
    .onclose([&clinicManager](crow::websocket::connection& conn, const std::string& reason, unsigned short code) {
        // When a connection is closed, release assigned patient if any
        // Broadcast the update to all remaining active connections
        // Remove the connection from the active set
        if (connectionToPatient.count(&conn)) {
            Patient* p = connectionToPatient[&conn];
            p->status = Unassigned;
            p->assignedCoordinator.clear();
            connectionToPatient.erase(&conn);
            // CROW_LOG_INFO << "Released patient " << p->patientID << " from connection on close";

            crow::json::wvalue update;
            update["type"] = "patientUnassigned";
            update["patientID"] = p->patientID;
            update["coordinator"] = "";

            for (auto* c : activeConnections) {
                if (c != &conn) {
                    c->send_text(update.dump());
                }
            }
        }
        activeConnections.erase(&conn);
 
        for (auto* c : activeConnections) {
            // CROW_LOG_INFO << "Onclose Active connection: " << c;
        }
        if (activeConnections.empty()) {
            // CROW_LOG_INFO << "No remaining active connections.";
        }
    });


}

inline void defineDownloadRoute(crow::App<AUTH, CORS>& app) {
    CROW_ROUTE(app, "/logfile")
    .methods("GET"_method)([]() {
        crow::response res;
        char cwd[1024];
        getcwd(cwd, sizeof(cwd));
        res.set_static_file_info("reports/transaction.txt");
        res.set_header("Content-Type", "text/plain");
        res.set_header("Content-Disposition", "attachment; filename=\"logReport.txt\"");
        return res;
    });
}