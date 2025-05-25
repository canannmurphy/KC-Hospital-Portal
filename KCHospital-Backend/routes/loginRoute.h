#pragma once

// Crow framework header for routing and server features
#include <crow.h>

// Custom middleware for authentication
#include "middlewares/authMiddleware.h"

// Middleware to handle CORS (Cross-Origin Resource Sharing)
#include "middlewares/corsMiddleware.h"

// Contains a map of valid coordinator names and access codes
#include "coordinators.h"

// Tracks active WebSocket connections and their associated names
#include "websocketRegistry.h"

// Defines the /login route for authenticating coordinators.
// Accepts POST requests with JSON body: { "name": string, "code": string }
void defineLoginRoute(crow::App<AUTH, CORS> &app) {
    CROW_ROUTE(app, "/login").methods("POST"_method)([](const crow::request &req)
                                                     {
        // Parse JSON body from the request
        auto body = crow::json::load(req.body);
        if (!body) return crow::response(400, "Invalid JSON");

        // Extract name and code from JSON
        std::string name = body["name"].s();
        std::string code = body["code"].s();

        // Validate name and code against the coordinators map
        auto it = coordinators.find(name);
        if (it != coordinators.end() && it->second == code) {
            return crow::response(200, "Login successful");
        }

        return crow::response(403, "Invalid login"); 
    });
}