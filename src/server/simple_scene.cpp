#include "simple_scene.hpp"

SimpleScene::SimpleScene(): Scene() {
    name = "simple scene";

    init();
}

void SimpleScene::init() {
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

        collider->rigidBody()->setAngularFactor(btVector3(0, 0, 0));
        collider->disable();

        playerObject->components.add(collider);
        colliders.push_back(collider);
        playerObjects.push_back(playerObject);
        tree.addChild(playerObjectsGroup, playerObject);
    }
}

void SimpleScene::tick(float dt) {
    Scene::tick(dt);

    for(const auto& collider: colliders) {
        collider->updateTransformFromRigidbody();
    }
}

shared_ptr<GameObject> SimpleScene::addPlayerObject(Player*) {
    auto playerObject = playerObjects[players.size()-1];
    auto collider = playerObject->components.get<Collider>();

    playerObject->visible = true;
    collider->enable();
    collider->rigidBody()->setActivationState(DISABLE_DEACTIVATION);

    collider->rigidBody()->getWorldTransform().setOrigin(vec3(0, 10, 1));
    collider->rigidBody()->getWorldTransform().setRotation(quat::getIdentity());

    return playerObject;
}

void SimpleScene::removePlayerObject(Player* player) {
    player->object->visible = false;
    player->object->components.get<Collider>()->disable();
}

void SimpleScene::processPlayerInput(Player* user) {
    auto rigidbody = user->object->components.get<Collider>()->rigidBody();
    auto velocity = vec3(user->input.deltaX, 0, user->input.deltaZ) * PlayerLinearSpeedFactor;

    velocity.setY(rigidbody->getLinearVelocity().y());

    rigidbody->setLinearVelocity(velocity);
}
