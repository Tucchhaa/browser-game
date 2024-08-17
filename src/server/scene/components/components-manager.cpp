#include "components-manager.hpp"
#include "transform.hpp"

#include "../game-object.hpp"
#include "../tree.hpp"

ComponentsManager::ComponentsManager(GameObject& gameObject) {
    this->gameObject = make_shared<GameObject>(gameObject);
}

template<typename T>
vector<shared_ptr<T>> ComponentsManager::_get(const bool all, bool required) {
    vector<shared_ptr<T>> result;

    for(auto& component : components) {
        const bool isSameType = typeid(*component) == typeid(T);

        if(isSameType) {
            result.push_back(static_pointer_cast<T>(component));

            if(!all)
                return result;
        }
    }

    if(required && result.size() == 0) {
        throw std::runtime_error("No ObjectComponent found with the provided type");
    }

    return result;
}

template<typename T>
shared_ptr<T> ComponentsManager::getOptional() {
    const auto results = _get<T>(false);

    return results.size() > 0 ? results[0] : nullptr;;
}

template<typename T>
shared_ptr<T> ComponentsManager::get() {
    return _get<T>(false, true)[0];
}

template<typename T>
vector<shared_ptr<T>> ComponentsManager::getAll() {
    return _get<T>(true);
}

template<typename T>
vector<shared_ptr<T>> ComponentsManager::getAllFromChildren() {
    vector<shared_ptr<T>> result;

    auto callback = [&](shared_ptr<GameObject>& gameObject) {
        vector<shared_ptr<T>> components = gameObject->components.getAll<T>();

        result.insert(result.end(), components.begin(), components.end());
    };

    Tree::traverseChildren(gameObject, callback);

    return result;
}

void ComponentsManager::add(const shared_ptr<ObjectComponent> &component) {
    components.push_back(component);

    component->gameObject = gameObject;
}

#define INSTANTIATE_COMPONENTS_MANAGER_FUNCTIONS(T) \
template shared_ptr<T> ComponentsManager::getOptional<T>(); \
template shared_ptr<T> ComponentsManager::get<T>(); \
template vector<shared_ptr<T>> ComponentsManager::getAll<T>(); \
template vector<shared_ptr<T>> ComponentsManager::getAllFromChildren<T>();

INSTANTIATE_COMPONENTS_MANAGER_FUNCTIONS(Transform);

