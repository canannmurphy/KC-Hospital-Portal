#pragma once
#include <crow.h>
#include "../coordinators.h"

struct AUTH {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context&) {
        if (req.url == "/login")
            return;

        const std::string& authHeader = req.get_header_value("Authorization");
        CROW_LOG_INFO << "Incoming Authorization header: " << authHeader;
        if (authHeader.rfind("Bearer ", 0) != 0) {
            res.code = 403;
            res.body = "Missing or invalid Authorization header";
            res.end();
            return;
        }

        std::string token = authHeader.substr(7); // Strip "Bearer "
        auto colonPos = token.find(':');
        if (colonPos == std::string::npos) {
            res.code = 403;
            res.body = "Malformed token";
            res.end();
            return;
        }

        std::string coordinator = token.substr(0, colonPos);
        std::string passcode = token.substr(colonPos + 1);

        auto it = coordinators.find(coordinator);
        if (it == coordinators.end() || it->second != passcode) {
            CROW_LOG_WARNING << "Unauthorized access attempt by: " << coordinator;
            res.code = 403;
            res.body = "Unauthorized";
            res.end();
        }
    }

    void after_handle(crow::request&, crow::response&, context&) {
        // No post-processing needed
    }
};