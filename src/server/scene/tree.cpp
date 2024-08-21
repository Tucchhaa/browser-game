#include "tree.hpp"

#include <queue>

Tree::Tree() {
    this->root = make_shared<GameObject>();
}

void Tree::addChild(shared_ptr<GameObject>& parent, shared_ptr<GameObject>& child) {
    if(child->parent)
        removeChild(child->parent, child);

    parent->children.insert(child);
    child->parent = parent;
}

void Tree::removeChild(shared_ptr<GameObject>& parent, shared_ptr<GameObject> &child) {
    parent->children.erase(child);
    child->parent = nullptr;
}

void Tree::addGameObject(shared_ptr<GameObject>& gameObject) {
    addChild(root, gameObject);
}

shared_ptr<GameObject> Tree::createGameObject() {
    return make_shared<GameObject>(GameObject());
}

shared_ptr<GameObject> Tree::spawnGameObject() {
    auto gameObject = createGameObject();

    addGameObject(gameObject);

    return gameObject;
}

void Tree::traverse(const function<void(shared_ptr<GameObject>& gameObject)>& callback) {
    traverseChildren(root, callback);
}

void Tree::traverseChildren(shared_ptr<GameObject>& gameObject, const function<void(shared_ptr<GameObject>&)>& callback) {
    queue<shared_ptr<GameObject>> q;
    q.push(gameObject);

    while(!q.empty()) {
        shared_ptr<GameObject> current = q.front();
        q.pop();

        callback(current);

        for(const auto& child: current->children)
            q.push(child);
    }
}

void updateTransform(shared_ptr<GameObject>& gameObject) {
    if(gameObject->parent == nullptr)
        return;

    gameObject->transform->updateAbsoluteValues(gameObject->parent->transform);
}

void Tree::updateTransforms() {
    traverse(updateTransform);
}

void Tree::updateTransforms(shared_ptr<GameObject>& gameObject) {
    traverseChildren(gameObject, updateTransform);
}