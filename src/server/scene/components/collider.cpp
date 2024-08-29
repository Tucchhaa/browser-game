#include "collider.hpp"
#include "transform.hpp"

Collider::Collider(
    const shared_ptr<PhysicsWorld> &physicsWorld,
    const vector<shared_ptr<Shape>> &shapes
): m_shapes(shapes), m_physicsWorld(physicsWorld)
{
    m_shape = make_shared<btCompoundShape>();

    for(const auto& shape: shapes) {
        m_shape->addChildShape(*shape->btTransformPtr(), shape->btShapePtr());
    }

    m_rigidBody = createRigidBody();

    for(const auto& shape: shapes) {
        shape->setRigidBody(m_rigidBody);
    }
}

Collider::~Collider() {
    if(m_rigidBody->getMotionState())
        delete m_rigidBody->getMotionState();

    m_physicsWorld->removeRigidBody(m_rigidBody);
}

shared_ptr<btBoxShape> Collider::createBoxShape(const vec3& scale) {
    auto box = make_shared<btBoxShape>(vec3(1, 1,1));

    box->setLocalScaling(scale);

    return box;
}

void Collider::onGameObjectSet() {
    ObjectComponent::onGameObjectSet();

    resetRigidbodyTransform();
}

void Collider::setMass(float mass) {
    this->m_mass = mass;

    m_physicsWorld->removeRigidBody(m_rigidBody);

    btVector3 inertia;
    m_rigidBody->getCollisionShape()->calculateLocalInertia( mass, inertia );
    m_rigidBody->setMassProps(btScalar(mass), inertia);

    m_physicsWorld->addRigidBody(m_rigidBody);
}

bool Collider::isDynamic() const {
    return m_mass != 0.f;
}

shared_ptr<btRigidBody> Collider::createRigidBody() const {
    btVector3 localInertia(0, 0, 0);
    if (isDynamic())
        m_shape->calculateLocalInertia(m_mass, localInertia);

    auto* motionState = new btDefaultMotionState(btTransform::getIdentity());
    const auto info = btRigidBody::btRigidBodyConstructionInfo(m_mass, motionState, m_shape.get(), localInertia);
    auto rigidBody = make_shared<btRigidBody>(info);

    m_physicsWorld->addRigidBody(rigidBody);

    return rigidBody;
}

void Collider::resetRigidbodyTransform() const {
    btTransform rigidbodyTransform;

    rigidbodyTransform.setOrigin(transform()->getPosition());
    rigidbodyTransform.setRotation(transform()->getRotation());

    m_rigidBody->setWorldTransform(rigidbodyTransform);
}

void Collider::updateTransformFromCollider() const {
    btTransform colliderTransform;

    if (m_rigidBody && m_rigidBody->getMotionState())
        m_rigidBody->getMotionState()->getWorldTransform(colliderTransform);
    else
        colliderTransform = m_rigidBody->getWorldTransform();

    const btVector3 position = colliderTransform.getOrigin();
    const btQuaternion rotation = colliderTransform.getRotation();

    transform()->setPosition(position.x(), position.y(), position.z());
    transform()->setRotation(rotation.x(), rotation.y(), rotation.z(), rotation.w());
}
