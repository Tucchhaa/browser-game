#include <iostream>
#include <unordered_set>
#include <mutex>

#include "nlohmann/json.hpp"
#include "crow.h"
#include "scene/scene.hpp"
#include "scene/components/collider.hpp"

class SimpleScene: public Scene {
public:
    SimpleScene(): Scene() {
        name = "simple scene";

        init();
    }

    void init() {
        // Create car
        auto car = tree.spawnGameObject();
        car->name = "car";
        car->model = "car/car.obj";
        car->material = "car/car.mtl";

        car->transform->translate(vec3(0, 100, 0));
        car->transform->rotate(quat(vec3(0, 1, 0), 3.1415f));

        auto carShape = make_shared<btBoxShape>(vec3(1, 1, 1));
        auto carCollider = make_shared<Collider>(physicsWorld, carShape);

        car->components.add(carCollider);

        // Create ground
        auto ground = tree.spawnGameObject();
        ground->name = "ground";
        ground->model = "plane.obj";
        ground->material = "plane.mtl";

        ground->transform->scaleBy(vec3(10, 1, 10));

        auto groundShape = make_shared<btBoxShape>(vec3(10, 1, 10));
        auto groundCollider = make_shared<Collider>(physicsWorld, groundShape);
        groundCollider->setMass(0.f);

        ground->components.add(groundCollider);

        colliders = { carCollider, groundCollider };
    }

    void tick(float dt) override {
        Scene::tick(dt);

        for(const auto& collider: colliders) {
            collider->updateTransformFromCollider();
        }
    }

private:
    vector<shared_ptr<Collider>> colliders;
};

class Room {
    using user_t = crow::websocket::connection;
public:
    int ID;

    shared_ptr<Scene> scene;

    Room() {
        ID = generateID();
        scene = make_shared<SimpleScene>();
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

    json getSceneData(json message) const {
        return {
            { "type", message["type"] },
            { "sceneName", scene->name },
            { "data", scene->getObjectsList() }
        };
    }

    json getSyncData(json message) const {
        return {
            { "type", message["type"] },
            { "send_timestamp", message["send_timestamp"] },
            { "transform", scene->getTransformData() }
        };
    }

    void start() const {
        auto scene = this->scene;

        thread([scene]() {
            constexpr unsigned int ms = 16;

            while(true) {
                scene->tick(ms/1000.);

                this_thread::sleep_for(chrono::milliseconds(ms));
            }
        }).detach();
    }

private:
    mutex mtx;
    unordered_set<user_t*> users;

    thread sceneThread;

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
        response["data"] = mainRoom->scene->getObjectsList();

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

            if (type == "sceneData") {
                conn.send_text(mainRoom->getSceneData(message).dump());
            }
            else if (type == "sync") {
                conn.send_text(mainRoom->getSyncData(message).dump());
            }
        });

    mainRoom->start();
    app.port(8081).multithreaded().run();

    return 0;
}
