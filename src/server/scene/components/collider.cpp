#include "collider.hpp"
#include "transform.hpp"

Collider::Collider(
    const shared_ptr<PhysicsWorld> &physicsWorld,
    const shared_ptr<btCollisionShape> &shape
): physicsWorld(physicsWorld), shape(shape) {
    rigidBody = createRigidBody();
}

Collider::~Collider() {
    if(rigidBody->getMotionState())
        delete rigidBody->getMotionState();

    physicsWorld->removeRigidBody(rigidBody);
}

void Collider::onGameObjectSet() {
    ObjectComponent::onGameObjectSet();

    updateColliderTransform();
}

void Collider::setMass(float mass) {
    this->mass = mass;

    physicsWorld->removeRigidBody(rigidBody);

    btVector3 inertia;
    rigidBody->getCollisionShape()->calculateLocalInertia( mass, inertia );
    rigidBody->setMassProps(btScalar(mass), inertia);

    physicsWorld->addRigidBody(rigidBody);
}

bool Collider::isDynamic() const {
    return mass != 0.f;
}

shared_ptr<btRigidBody> Collider::getRigidBody() const {
    return rigidBody;
}

shared_ptr<btRigidBody> Collider::createRigidBody() const {
    btVector3 localInertia(0, 0, 0);
    if (isDynamic())
        shape->calculateLocalInertia(mass, localInertia);

    auto* motionState = new btDefaultMotionState(btTransform::getIdentity());
    const auto info = btRigidBody::btRigidBodyConstructionInfo(mass, motionState, shape.get(), localInertia);
    auto rigidBody = make_shared<btRigidBody>(info);

    physicsWorld->addRigidBody(rigidBody);

    return rigidBody;
}

btTransform Collider::getColliderTransform() const {
    btTransform colliderTransform;

    colliderTransform.setOrigin(transform()->getPosition());
    colliderTransform.setRotation(transform()->getRotation());

    return colliderTransform;
}

void Collider::updateColliderTransform() const {
    const btTransform colliderTransform = getColliderTransform();

    rigidBody->setWorldTransform(colliderTransform);
}

void Collider::updateTransformFromCollider() const {
    btTransform colliderTransform;

    if (rigidBody && rigidBody->getMotionState())
        rigidBody->getMotionState()->getWorldTransform(colliderTransform);
    else
        colliderTransform = rigidBody->getWorldTransform();

    const btVector3 position = colliderTransform.getOrigin();
    const btQuaternion rotation = colliderTransform.getRotation();

    transform()->setPosition(position.x(), position.y(), position.z());
    transform()->setRotation(rotation.x(), rotation.y(), rotation.z(), rotation.w());
}
