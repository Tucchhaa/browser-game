#include "physics_world.hpp"

PhysicsWorld::PhysicsWorld() {
    collisionConfiguration = make_unique<btDefaultCollisionConfiguration>();
    dispatcher             = make_unique<btCollisionDispatcher>(collisionConfiguration.get());
    overlappingPairCache   = make_unique<btDbvtBroadphase>();
    solver                 = make_unique<btSequentialImpulseConstraintSolver>();
    dynamicsWorld          = make_unique<btDiscreteDynamicsWorld>(
        dispatcher.get(), overlappingPairCache.get(),
        solver.get(), collisionConfiguration.get()
    );

    dynamicsWorld->setGravity(gravity);
}

void PhysicsWorld::addRigidBody(const shared_ptr<btRigidBody>& rigidBody) const {
    dynamicsWorld->addRigidBody(rigidBody.get());
}

void PhysicsWorld::removeRigidBody(const shared_ptr<btRigidBody>& rigidBody) const {
    dynamicsWorld->removeRigidBody(rigidBody.get());
}

