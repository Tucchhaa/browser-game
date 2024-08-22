#pragma once

#include <LinearMath/btMatrix3x3.h>
#include <LinearMath/btQuaternion.h>
#include <LinearMath/btVector3.h>

#include "component.hpp"

using namespace std;

using vec3 = btVector3;
using quat = btQuaternion;
using mat3 = btMatrix3x3;

class Transform : public ObjectComponent {
public:
    static const Transform World;

private:
    vec3 parentAbsolutePosition = vec3(0, 0, 0);

    vec3 parentAbsoluteScale = vec3(1, 1, 1);

    quat parentAbsoluteRotation = quat(0, 0, 0);

    // ===

    vec3 position;

    vec3 scale;

    quat rotation;

public:
    explicit Transform(
        const vec3& position = vec3(0, 0, 0),
        const quat &rotation = quat(0, 0, 0),
        const vec3 &scale = vec3(1, 1, 1)
    );

    void print() const;

    void setPosition(float x, float y, float z);
    void setPosition(const vec3 &position);

    void setRotation(float x, float y, float z, float w);
    void setRotation(const quat &rotation);

    void setScale(float s);
    void setScale(float x, float y, float z);
    void setScale(const vec3 &scale);

    void translate(const vec3 &vector, const Transform* transform = nullptr);

    void rotate(const quat &rotation, const Transform* transform = nullptr);

    void scaleBy(float s);
    void scaleBy(float x, float y, float z);
    void scaleBy(const vec3 &scale);

// ===
// Computations
// ===
    void updateAbsoluteValues(shared_ptr<Transform>& parentTransform);

// ===
// Getters
// ===

    vec3 getPosition() const;

    vec3 getScale() const;

    quat getRotation() const;

    vec3 getAbsolutePosition() const;

    vec3 getAbsoluteScale() const;

    quat getAbsoluteRotation() const;
};
