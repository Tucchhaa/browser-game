#pragma once

#include "btBulletDynamicsCommon.h"

class PhysicsWorld {
public:
    btDiscreteDynamicsWorld* dynamicsWorld;

    PhysicsWorld();

    ~PhysicsWorld();

    void addRigidBody(btRigidBody* rigidBody) const;

    void removeRigidBody(btRigidBody* rigidBody) const;

private:
    btDefaultCollisionConfiguration* collisionConfiguration;

    btCollisionDispatcher* dispatcher;

    btBroadphaseInterface* overlappingPairCache;

    btSequentialImpulseConstraintSolver* solver;

    btVector3 gravity = btVector3(0, -15, 0);

    btAlignedObjectArray<btCollisionShape*> collisionShapes;
};