#pragma once
#include <memory>

class GameObject;
class Transform;

class ObjectComponent {
public:
    int ComponentID;

    std::shared_ptr<GameObject> gameObject;

    ObjectComponent();

    [[nodiscard]] int gameObjectID() const;
    [[nodiscard]] std::shared_ptr<Transform> transform() const;

private:
    static inline int count = 1;

    static int generateComponentId() {
        return count++;
    }
};
