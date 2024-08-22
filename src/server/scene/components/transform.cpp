#include "transform.hpp"
#include <iostream>

using namespace std;

const Transform Transform::World = Transform();

Transform::Transform(const vec3& position, const quat &rotation, const vec3 &scale) :
    position(position), scale(scale), rotation(rotation)
{ }

void Transform::print() const {
    cout << "Local coordinates: " << endl;
    cout << "position: " << position.x() << " " << position.y() << " " << position.z() << endl;
    cout << "rotation: " << rotation.x() << " " << rotation.y() << " " << rotation.z() << " " << rotation.w() << endl;
    cout << "scale: " << scale.x() << " " << scale.y() << " " << scale.z() << endl;

    const vec3 absolutePosition = getAbsolutePosition();
    const vec3 absoluteScale = getAbsoluteScale();
    const quat absoluteRotation = getAbsoluteRotation();

    cout << "Absolute coordinates: " << endl;
    cout << "position: " << absolutePosition.x() << " " << absolutePosition.y() << " " << absolutePosition.z() << endl;
    cout << "rotation: " << absoluteRotation.x() << " " << absoluteRotation.y() << " " << absoluteRotation.z() << " " << absoluteRotation.w() << endl;
    cout << "scale: " << absoluteScale.x() << " " << absoluteScale.y() << " " << absoluteScale.z() << endl;
    cout << endl;
}

void Transform::setPosition(float x, float y, float z) {
    this->position = vec3(x, y, z);
}

void Transform::setPosition(const vec3 &position) {
    this->position = position;
}

void Transform::setRotation(float x, float y, float z, float w) {
    this->rotation = quat(x, y, z, w);
}

void Transform::setRotation(const quat &rotation) {
    this->rotation = rotation;
}

void Transform::setScale(float s) {
    this->scale = vec3(s, s, s);
}

void Transform::setScale(float x, float y, float z) {
    this->scale = vec3(x, y, z);
}

void Transform::setScale(const vec3 &scale) {
    this->scale = scale;
}

void Transform::translate(const vec3 &vector, const Transform* transform) {
    // vector.setZ(-vector.z());

    position += vector.rotate(rotation.getAxis(), rotation.getAngle());;
}

void Transform::rotate(const quat &rotation, const Transform* transform) {
    if(transform != nullptr && transform != this) {
        auto conjugate = [](const quat& q) {
            return quat(-q.x(), -q.y(), -q.z(), q.w());
        };

        const quat relativeRotation = (transform->rotation * rotation) * conjugate(transform->rotation);

        
        this->rotation = relativeRotation * this->rotation;
    }
    else
        this->rotation *= rotation;
}

void Transform::scaleBy(float s) {
    this->scale = this->scale * s;
}

void Transform::scaleBy(float x, float y, float z) {
    this->scale = this->scale * vec3(x, y, z);
}

void Transform::scaleBy(const vec3 &scale) {
    // (a.x * b.x, a.y * b.y, a.z * b.z)
    this->scale = this->scale * scale;
}

// ===
// Getters
// ===

vec3 Transform::getPosition() const {
    return position;
}

vec3 Transform::getScale() const {
    return scale;
}

quat Transform::getRotation() const {
    return rotation;
}

vec3 Transform::getAbsolutePosition() const {
    return parentAbsolutePosition + position;
}

vec3 Transform::getAbsoluteScale() const {
    return parentAbsoluteScale * scale;
}

quat Transform::getAbsoluteRotation() const {
    return parentAbsoluteRotation * rotation;
}

// ===
// Calculations
// ===

void Transform::updateAbsoluteValues(shared_ptr<Transform>& parentTransform) {
    parentAbsolutePosition = parentTransform->parentAbsolutePosition + parentTransform->position;
    parentAbsoluteRotation = parentTransform->parentAbsoluteRotation * parentTransform->rotation;
    parentAbsoluteScale = parentTransform->parentAbsoluteScale * parentTransform->scale;
}
