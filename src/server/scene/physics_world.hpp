#pragma once

#include <memory>
#include "bullet/btBulletDynamicsCommon.h"

using namespace std;

class PhysicsWorld {
public:
    unique_ptr<btDynamicsWorld> dynamicsWorld;

    PhysicsWorld();

    void addRigidBody(const shared_ptr<btRigidBody>& rigidBody) const;

    void removeRigidBody(const shared_ptr<btRigidBody>& rigidBody) const;

private:
    unique_ptr<btDefaultCollisionConfiguration> collisionConfiguration;

    unique_ptr<btCollisionDispatcher> dispatcher;

    unique_ptr<btBroadphaseInterface> overlappingPairCache;

    unique_ptr<btSequentialImpulseConstraintSolver> solver;

    btVector3 gravity = btVector3(0, -10, 0);

    btAlignedObjectArray<shared_ptr<btCollisionShape>> collisionShapes;
};