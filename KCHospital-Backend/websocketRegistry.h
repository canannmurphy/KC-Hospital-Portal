#pragma once
// This header defines a global registry for tracking active WebSocket connections.
// It maps each WebSocket connection to the name of the authenticated coordinator.

#include <unordered_set>
// Include Crow's WebSocket interface
#include <crow/websocket.h>

// inline std::unordered_map<crow::websocket::connection*, Patient*> connectionToPatient;


// Map each WebSocket connection to the corresponding coordinator name
static std::unordered_set<crow::websocket::connection*> activeConnections;