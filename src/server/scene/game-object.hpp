#pragma once

#include <set>
#include <string>

#include "components/components-manager.hpp"
#include "components/transform.hpp"

class GameObject {
public:
    int ID;

    shared_ptr<GameObject> parent;

    set<shared_ptr<GameObject>> children;

    shared_ptr<Transform> transform;

    ComponentsManager components;

    string name;
    string model;
    string material;
    bool visible;

    /**
     * Don't use it directly, use GameObject::create() instead
     */
    explicit GameObject(Transform& transform);

    static shared_ptr<GameObject> create(Transform& transform) {
        auto gameObject = make_shared<GameObject>(transform);

        gameObject->components.setGameObject(gameObject);

        return gameObject;
    }

    static shared_ptr<GameObject> create() {
        return create(*make_shared<Transform>());
    }
private:
    static inline int lastID = 1;

    static int generateId() {
        return lastID++;
    }
};
