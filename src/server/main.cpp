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

        auto carShape = make_shared<Shape>(
            make_shared<btTransform>(btTransform::getIdentity()),
            Collider::createBoxShape(vec3(0.5, 0.25, 1))
        );
        auto carCollider = make_shared<Collider>(physicsWorld, vector { carShape });

        car->components.add(carCollider);
        colliders.push_back(carCollider);

        // Create ground
        auto ground = tree.spawnGameObject();
        ground->name = "ground";
        ground->model = "plane.obj";
        ground->material = "plane.mtl";

        ground->transform->scaleBy(vec3(30, 1, 30));

        auto groundShapeTransform = make_shared<btTransform>(btTransform::getIdentity());
        groundShapeTransform->setOrigin(vec3(0, -1, 0));

        auto groundShape = make_shared<Shape>(
            groundShapeTransform,
            Collider::createBoxShape(ground->transform->getScale())
        );

        auto groundCollider = make_shared<Collider>(physicsWorld, vector { groundShape });
        groundCollider->setMass(0.f);

        ground->components.add(groundCollider);
        colliders.push_back(groundCollider);

        // Create players game objects
        auto playerObjectsGroup = tree.spawnGameObject();

        constexpr int PLAYERS_NUM = 5;

        for(int i=0; i < PLAYERS_NUM; i++) {
            auto playerObject = tree.createGameObject();
            playerObject->name = "player_" + to_string(i);
            playerObject->visible = false;
            playerObject->model = "cube.obj";
            playerObject->material = "cube.mtl";

            playerObject->transform->setScale(vec3(0.5, 0.75, 0.5));

            auto transform = make_shared<btTransform>(btTransform::getIdentity());
            auto shape = make_shared<Shape>(transform, Collider::createBoxShape(playerObject->transform->getScale()));
            auto collider = make_shared<Collider>(physicsWorld, vector { shape });

            collider->disable();

            playerObject->components.add(collider);
            colliders.push_back(collider);
            playerObjects.push_back(playerObject);
            tree.addChild(playerObjectsGroup, playerObject);
        }
    }

    void tick(float dt) override {
        Scene::tick(dt);

        for(const auto& collider: colliders) {
            collider->updateTransformFromRigidbody();
        }
    }

protected:
    shared_ptr<GameObject> addPlayerObject(Player*) override {
        auto playerObject = playerObjects[players.size()-1];
        auto collider = playerObject->components.get<Collider>();

        playerObject->visible = true;
        collider->enable();

        collider->rigidBody()->getWorldTransform().setOrigin(vec3(0, 10, 1));
        collider->rigidBody()->getWorldTransform().setRotation(quat::getIdentity());

        return playerObject;
    }

    void removePlayerObject(Player* player) override {
        player->object->visible = false;
        player->object->components.get<Collider>()->disable();
    }

    void processUserInput(Player* user) override {
        btScalar x = (user->input.keyboard.right   ? 1.f : 0.f) - (user->input.keyboard.left     ? 1.f : 0.f);
        btScalar z = (user->input.keyboard.forward ? 1.f : 0.f) - (user->input.keyboard.backward ? 1.f : 0.f);

        auto rigidbody = user->object->components.get<Collider>()->rigidBody();
        auto velocity = vec3(x, rigidbody->getLinearVelocity().y(), z);

        rigidbody->setLinearVelocity(velocity);
    }

private:
    vector<shared_ptr<Collider>> colliders;

    vector<shared_ptr<GameObject>> playerObjects;
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
        lock_guard _(users_mtx);

        const auto sceneUser = new Player();

        users.insert(&user);
        user.userdata(sceneUser);
        scene->addUser(sceneUser);
    }

    void removeUser(user_t& user) {
        lock_guard _(users_mtx);

        const auto sceneUser = static_cast<Player*>(user.userdata());

        users.erase(&user);
        scene->removeUser(sceneUser);
    }

    void send(const string& text) {
        lock_guard _(users_mtx);

        for(auto* user : users) {
            user->send_text(text);
        }
    }

    json getSceneData(json message) const {
        return {
            { "type", message["type"] },
            { "sceneName", scene->name },
            { "root", SceneSerializer::getSceneData(scene) }
        };
    }

    json getSyncData(user_t& user, json message) const {
        auto player = static_cast<Player*>(user.userdata());

        player->input.keyboard.forward = message["input"]["keyboard"]["forward"];
        player->input.keyboard.backward = message["input"]["keyboard"]["backward"];
        player->input.keyboard.left = message["input"]["keyboard"]["left"];
        player->input.keyboard.right = message["input"]["keyboard"]["right"];
        player->input.keyboard.jump = message["input"]["keyboard"]["jump"];

        player->input.mouse.leftButton = message["input"]["mouse"]["leftButton"];
        player->input.mouse.rightButton = message["input"]["mouse"]["rightButton"];

        return {
            { "type", message["type"] },
            { "send_timestamp", message["send_timestamp"] },
            { "transform", SceneSerializer::getTransformData(scene) },
        };
    }

    void start() const {
        thread([this]() {
            constexpr unsigned int ms = 16;

            while(true) {
                scene->tick(ms/1000.);

                this_thread::sleep_for(chrono::milliseconds(ms));
            }
        }).detach();
    }

private:
    mutex users_mtx;
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
        response["data"] = SceneSerializer::getSceneData(mainRoom->scene);

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
        .onmessage([&](crow::websocket::connection& connection, const string& data, bool is_binary) {
            json message = json::parse(data);
            const string type = message["type"];

            if (type == "sceneData") {
                connection.send_text(mainRoom->getSceneData(message).dump());
            }
            else if (type == "sync") {
                connection.send_text(mainRoom->getSyncData(connection, message).dump());
            }
        });

    mainRoom->start();
    app.port(8081).multithreaded().run();

    return 0;
}
