#include "game-object.hpp"

#include <queue>

GameObject::GameObject(Transform& transform): components(*this) {
    ID = generateId();

    name = "gameObject_" + to_string(ID);
    model = "";
    material = "";

    this->transform = make_shared<Transform>(transform);

    components.add(this->transform);
}

GameObject::GameObject(): transform(new Transform()), components(*this) {
    ID = generateId();

    components.add(transform);
}
