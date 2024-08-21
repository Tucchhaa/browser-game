#pragma once

#include <vector>
#include <map>

#include "game-object.hpp"

using namespace std;

class Tree {
public:
    Tree();

    shared_ptr<GameObject> getGameObjectByID(int ID);

    void addChild(shared_ptr<GameObject>& parent, shared_ptr<GameObject>& child);

    void removeChild(shared_ptr<GameObject>& parent, shared_ptr<GameObject>& child);

    void addGameObject(shared_ptr<GameObject>& gameObject);

    shared_ptr<GameObject> createGameObject();

    shared_ptr<GameObject> spawnGameObject();

    void traverse(const function<void(shared_ptr<GameObject>&)>& callback);

    static void traverseChildren(
        const shared_ptr<GameObject>& gameObject,
        const function<void(shared_ptr<GameObject>&)>& callback
    );

    static void traverseDirectChildren(
        const shared_ptr<GameObject>& gameObject,
        const function<void(const shared_ptr<GameObject>&)>& callback
    );

    void updateTransforms();

    static void updateTransforms(shared_ptr<GameObject>& gameObject);

private:
    shared_ptr<GameObject> root;

    map<int, shared_ptr<GameObject>> id_gameObject;
};
