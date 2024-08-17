#include "component.hpp"

#include "../game-object.hpp"

ObjectComponent::ObjectComponent() {
    ComponentID = generateComponentId();
}

int ObjectComponent::gameObjectID() const {
    return gameObject->ID;
}

shared_ptr<Transform> ObjectComponent::transform() const {
    return gameObject->transform;
}
