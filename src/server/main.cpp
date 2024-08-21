#include <iostream>
#include <unordered_set>
#include <mutex>

#include "nlohmann/json.hpp"
#include "crow.h"
#include "scene/scene.hpp"

class SimpleScene: public Scene {
public:
    SimpleScene(): Scene() {
        name = "simple scene";

        init();
    }

    void init() {
        auto car = tree.spawnGameObject();
        car->name = "car";
        car->model = "car/car.obj";
        car->material = "car/car.mtl";

        car->transform->translate(vec3(0, 0.25, 0));
        car->transform->rotate(angleAxis(3.1415f, vec3(0, 1, 0)));

        auto ground = tree.spawnGameObject();
        ground->name = "ground";
        ground->model = "plane.obj";
        ground->material = "plane.mtl";

        ground->transform->scaleBy(vec3(10, 1, 10));
    }
};

class Room {
    using user_t = crow::websocket::connection;
public:
    int ID;

    Scene scene;

    Room(): ID(generateID()), scene(Scene()) {
        scene = SimpleScene();
    }

    void addUser(user_t& user) {
        lock_guard _(mtx);
        users.insert(&user);
    }

    void removeUser(user_t& user) {
        lock_guard _(mtx);
        users.erase(&user);
    }

    void send(const string& text) {
        lock_guard _(mtx);

        for(auto* user : users) {
            user->send_text(text);
        }
    }

    json getSceneData(json message) {
        return {
            { "type", message["type"] },
            { "sceneName", scene.name },
            { "data", scene.getObjectsList() }
        };
    }

    json getSyncData(json message) {
        return {
            { "type", message["type"] },
            { "send_timestamp", message["send_timestamp"] },
            { "transform", scene.getTransformData() }
        };
    }

private:
    mutex mtx;
    unordered_set<user_t*> users;

    static int generateID() {
        static int count = 0;
        return count++;
    }
};

int main() {
    crow::SimpleApp app;

    unordered_set<crow::websocket::connection*> users;
    unordered_set<Room*> rooms;

    const auto mainRoom = new Room();

    rooms.insert(mainRoom);

    CROW_ROUTE(app, "/")([]() {
       return "Hello World";
    });

    CROW_ROUTE(app, "/json")([&]() {
        nlohmann::json response;
        response["type"] = "requestSceneData";
        response["sceneName"] = "scene1";
        response["data"] = mainRoom->scene.getObjectsList();

        return response.dump();
    });

    CROW_WEBSOCKET_ROUTE(app, "/ws")
        .onopen([&](crow::websocket::connection& connection) {
            CROW_LOG_INFO << "new websocket connection from " << connection.get_remote_ip();

            mainRoom->addUser(connection);

            connection.send_text(R"({ "info": "aboba" })");
        })
        .onclose([&](crow::websocket::connection& connection, const string& reason) {
            CROW_LOG_INFO << "websocket connection closed: " << reason;

            mainRoom->removeUser(connection);
        })
        .onmessage([&](crow::websocket::connection& conn, const string& data, bool is_binary) {
            json message = json::parse(data);
            const string type = message["type"];

            CROW_LOG_INFO << "received message type: " << type;

            if (type == "sceneData") {
                conn.send_text(mainRoom->getSceneData(message).dump());
            }
            else if (type == "sync") {
                conn.send_text(mainRoom->getSyncData(message).dump());
            }
            else {
                conn.send_text(R"({ "info": "message" })");
            }
        });

    app.port(8081).multithreaded().run();

    return 0;
}
