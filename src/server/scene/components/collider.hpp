#pragma once

#include "btBulletDynamicsCommon.h"

#include "component.hpp"
#include "transform.hpp"
#include "../physics_world.hpp"

using namespace std;

class Shape {
public:
    int Shape_ID;

    Shape(const shared_ptr<btTransform> &transform, const shared_ptr<btCollisionShape> &shape)
        : Shape_ID(generateId()), m_bttransform(transform), m_btshape(shape) {}

    btCollisionShape* btShapePtr() const { return m_btshape.get(); }

    btTransform* btTransformPtr() const { return m_bttransform.get(); }

    void setRigidBody(const shared_ptr<btRigidBody> &rigidBody) {
        m_rigidBody = rigidBody;
    }

    vec3 getWorldPosition() const { return m_rigidBody->getWorldTransform().getOrigin() + m_bttransform->getOrigin(); }

    quat getWorldRotation() const { return m_rigidBody->getWorldTransform().getRotation(); } // TODO: adjust this

    vec3 getWorldScaling() const { return  m_btshape->getLocalScaling(); }  // TODO: adjust this

    string getName() const { return m_btshape->getName(); }

private:
    shared_ptr<btTransform> m_bttransform;
    shared_ptr<btCollisionShape> m_btshape;
    shared_ptr<btRigidBody> m_rigidBody;

    static inline int lastID = 1;

    static int generateId() {
        return lastID++;
    }
};

class Collider: public ObjectComponent {
public:

    explicit Collider(
        const shared_ptr<PhysicsWorld> &physicsWorld,
        const vector<shared_ptr<Shape>> &shapes
    );

    virtual ~Collider();

    static shared_ptr<btBoxShape> createBoxShape(const vec3& scale = vec3(1, 1, 1));

    void onGameObjectSet() override;

    void setMass(float mass);

    bool isDynamic() const;

    shared_ptr<btRigidBody> rigidBody() const { return m_rigidBody; }

    const vector<shared_ptr<Shape>>& shapes() const { return m_shapes; }

    /**
     * Updates transform of game object from collider transform
     */
    void updateTransformFromCollider() const;

private:
    shared_ptr<btCompoundShape> m_shape;
    vector<shared_ptr<Shape>> m_shapes;
    shared_ptr<btRigidBody> m_rigidBody;

    float m_mass = 1.;

    shared_ptr<PhysicsWorld> m_physicsWorld;

    shared_ptr<btRigidBody> createRigidBody() const;

    void resetRigidbodyTransform() const;
};
