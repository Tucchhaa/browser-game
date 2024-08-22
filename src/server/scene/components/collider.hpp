#pragma once

#include "btBulletDynamicsCommon.h"

#include "component.hpp"
#include "../physics_world.hpp"

using namespace std;

class Collider: public ObjectComponent {
public:
    explicit Collider(
        const shared_ptr<PhysicsWorld> &physicsWorld,
        const shared_ptr<btCollisionShape> &shape
    );

    virtual ~Collider();

    void onGameObjectSet() override;

    void setMass(float mass);

    bool isDynamic() const;

    shared_ptr<btRigidBody> getRigidBody() const;

    /**
     * Updates transform of game object from collider transform
     */
    void updateTransformFromCollider() const;

private:
    float mass = 1.;

    shared_ptr<btCollisionShape> shape;

    shared_ptr<PhysicsWorld> physicsWorld;

    shared_ptr<btRigidBody> rigidBody;

    shared_ptr<btRigidBody> createRigidBody() const;

    btTransform getColliderTransform() const;

    void updateColliderTransform() const;
};
