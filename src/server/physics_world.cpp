#include "physics_world.hpp"

PhysicsWorld::PhysicsWorld() {
    collisionConfiguration = new btDefaultCollisionConfiguration();
    dispatcher = new btCollisionDispatcher(collisionConfiguration);
    overlappingPairCache = new btDbvtBroadphase();
    solver = new btSequentialImpulseConstraintSolver;
    dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);

    dynamicsWorld->setGravity(gravity);
}

PhysicsWorld::~PhysicsWorld() {
    for (int i = 0; i < dynamicsWorld->getNumCollisionObjects(); i++) {
        btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[i];
        btRigidBody* body = btRigidBody::upcast(obj);

        if (body && body->getMotionState())
            delete body->getMotionState();

        dynamicsWorld->removeCollisionObject(obj);
        delete obj;
    }

    for (int j = 0; j < collisionShapes.size(); j++)
        delete collisionShapes[j];

    delete dynamicsWorld;
    delete solver;
    delete overlappingPairCache;
    delete dispatcher;
    delete collisionConfiguration;

    collisionShapes.clear();
}

void PhysicsWorld::addRigidBody(btRigidBody* rigidBody) const {
    dynamicsWorld->addRigidBody(rigidBody);
}

void PhysicsWorld::removeRigidBody(btRigidBody* rigidBody) const {
    dynamicsWorld->removeRigidBody(rigidBody);
}

