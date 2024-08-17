#pragma once

#include <set>

#include "components/components-manager.hpp"
#include "components/transform.hpp"

class GameObject {
public:
    int ID;

    shared_ptr<GameObject> parent;

    set<shared_ptr<GameObject>> children;

    shared_ptr<Transform> transform;

    ComponentsManager components;

    GameObject();
    explicit GameObject(Transform& transform);


private:
    static inline int lastID = 1;

    static int generateId() {
        return lastID++;
    }
};
