#pragma once

#include <vector>

#include "component.hpp"

using namespace std;

class ComponentsManager {
private:
    shared_ptr<GameObject> gameObject;

    vector<shared_ptr<ObjectComponent>> components;

public:
    explicit ComponentsManager(GameObject &gameObject);

    template<typename T>
    shared_ptr<T> getOptional();

    template<typename T>
    shared_ptr<T> get();

    template<typename T>
    vector<shared_ptr<T>> getAll();

    template<typename T>
    vector<shared_ptr<T>> getAllFromChildren();

    void add(const shared_ptr<ObjectComponent> &component);

private:
    /**
     * returns components of objectId
     */
    template<typename T>
    vector<shared_ptr<T>> _get(bool all, bool required = false);
};


