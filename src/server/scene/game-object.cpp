#include "game-object.hpp"

#include <queue>

GameObject::GameObject(Transform& transform): components(*this) {
    ID = generateId();

    this->transform = make_shared<Transform>(transform);

    components.add(this->transform);
}

GameObject::GameObject(): transform(new Transform()), components(*this) {
    ID = generateId();

    components.add(transform);
}
