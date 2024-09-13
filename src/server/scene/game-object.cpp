#include "game-object.hpp"

#include <queue>

GameObject::GameObject(Transform& transform) {
    ID = generateId();

    name = "gameObject_" + to_string(ID);
    model = "";
    material = "";
    visible = true;

    this->transform = make_shared<Transform>(transform);

    components.add(this->transform);
}

// GameObject::GameObject(): GameObject(*make_shared<Transform>()) {}
