#pragma once
#include <crow.h>

struct CORS
{
    struct context {};

    void before_handle(crow::request &req, crow::response &res, context &)
    {
        // CROW_LOG_DEBUG << "CORS middleware triggered for method: " << req.method_name();
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");

        if (req.method == "OPTIONS"_method) {
            res.code = 204;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.end();
            return;
        }
    }

    void after_handle(crow::request &, crow::response &res, context &)
    {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    }
};