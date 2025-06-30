import {THREE} from '../utils/three-defs.ts';
import {Component, Entity} from '../engine/entity.ts';
import {rand_range, sat} from '../utils/math.ts';
import { SpatialGridController } from '../engine/spatial-grid-controller.ts';


const _COLLISION_FORCE = 25;
const _WANDER_FORCE = 1;
const _ATTACK_FORCE = 25;
const _MAX_TARGET_DISTANCE = 1500;
const _MAX_ANGLE = 0.9;

export class EnemyAIController extends Component {

  grid_: SpatialGridController;
  maxSteeringAcc_: number;
  maxSpeed_: number;
  acceleration_: number;
  velocity_: THREE.Vector3;
  wanderAngle_: number;
  quaternion_: THREE.Quaternion;
  target_: null | Entity;

  constructor() {
    super();
    // this.grid_ = grid;
    this.Init_();
  }

  Init_() {
    this.maxSteeringAcc_ = 30;
    this.maxSpeed_  = 100;
    this.acceleration_ = 10;
    this.velocity_ = new THREE.Vector3(0, 0, -1);
    this.wanderAngle_ = 0.0;
    this.quaternion_ = new THREE.Quaternion();
    this.target_ = null;
  }

  InitEntity() {
      this.grid_ = this.Parent!.GetComponent('SpatialGridController') as SpatialGridController;
  }

  ApplySteering_(timeElapsed: number) {
    const originAcc = this.ApplySeek_(this.target_);

    const wanderAcc = this.ApplyWander_();
    const collisionAcc = this.ApplyCollisionAvoidance_();
    const attackAcc = this.ApplyAttack_();

    const steeringAcc = new THREE.Vector3(0, 0, 0);
    steeringAcc.add(originAcc);
    steeringAcc.add(wanderAcc);
    steeringAcc.add(collisionAcc);
    steeringAcc.add(attackAcc);

    steeringAcc.multiplyScalar(this.acceleration_);

    // Clamp the force applied
    if (steeringAcc.length() > this.maxSteeringAcc_) {
      steeringAcc.normalize();
      steeringAcc.multiplyScalar(this.maxSteeringAcc_);
    }

    steeringAcc.multiplyScalar(timeElapsed);
    this.velocity_.add(steeringAcc);

    // Clamp velocity
    this.velocity_.normalize();
    const unit_vel = this.velocity_.clone();
    this.velocity_.multiplyScalar(this.maxSpeed_);

    const frameVelocity = this.velocity_.clone();
    frameVelocity.multiplyScalar(timeElapsed);
    frameVelocity.add(this.Parent!.Position);

    this.Parent!.SetPosition(frameVelocity);

    
    const mat = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    mat.lookAt(new THREE.Vector3(), unit_vel, THREE.Object3D.DEFAULT_UP);
    quat.setFromRotationMatrix(mat);
    this.Parent!.SetQuaternion(quat);
      
  }

  Update(timeElapsed: number) {
    if (!this.Parent!.Attributes!.roughRadius) {
      // this.ApplyCollisionAvoidance_();
      return;
    }
    this.ApplySteering_(timeElapsed);
    this.MaybeFire_();
  }

  MaybeFire_() {
    if (!this.target_) {
      return;
    }

    const forward = this.Parent!.Forward;
    const dirToTarget = this.target_.Position.clone().sub(
        this.Parent!.Position);
    dirToTarget.normalize();

    const angle = dirToTarget.dot(forward);
    if (angle > _MAX_ANGLE) {
      this.Broadcast({topic: 'player.fire'});
      return;
    }
  }

  ApplyCollisionAvoidance_() {
    const pos = this.Parent!.Position;

    const colliders = this.grid_.FindNearbyEntities(500);

    const force = new THREE.Vector3(0, 0, 0);

    for (const c of colliders) {
      if (this.target_ && c.entity.ID == this.target_.ID) 
        continue; // Don't avoid the target
      
      const entityPos = c.entity.Position;
      const entityRadius = c.entity.Attributes!.roughRadius!;
      const dist = entityPos.distanceTo(pos);

      if (dist > (entityRadius + 500)) {
        continue;
      }

      const directionFromEntity = pos.clone().sub(entityPos);
      const multiplier = (entityRadius + this.Parent!.Attributes!.roughRadius!) / Math.max(1, (dist - 200));
      directionFromEntity.normalize();
      directionFromEntity.multiplyScalar(multiplier * _COLLISION_FORCE);
      force.add(directionFromEntity);
    }

    return force;
  }

  ApplyWander_() : THREE.Vector3 {
    this.wanderAngle_ += 0.1 * rand_range(-2 * Math.PI, 2 * Math.PI);
    const randomPointOnCircle = new THREE.Vector3(
        Math.cos(this.wanderAngle_),
        0,
        Math.sin(this.wanderAngle_));
    const pointAhead = this.Parent!.Forward.clone();
    pointAhead.multiplyScalar(20);
    pointAhead.add(randomPointOnCircle);
    pointAhead.normalize();
    return pointAhead.multiplyScalar(_WANDER_FORCE);
  }

  ApplySeek_(target: Entity | null) : THREE.Vector3 {
    if (!target || !target.Attributes!.roughRadius) {
      return new THREE.Vector3(0, 0, 0);
    }
    const dist = this.Parent!.Position.distanceTo(target.Position);
    const radius = target.Attributes!.roughRadius;
    const distFactor = Math.max(
        0, ((dist - radius) / (radius * 0.25))) ** 2;
    const direction = target.Position.clone().sub(this.Parent!.Position);
    direction.normalize();

    const forceVector = direction.multiplyScalar(distFactor);
    return forceVector;
  }

  AcquireTarget_() {
    this.target_ = this.FindEntity('player');
  }

  ApplyAttack_() : THREE.Vector3 {
    if (!this.target_) {
      this.AcquireTarget_();
      return new THREE.Vector3(0, 0, 0);
    }

    if (this.target_.Position.distanceTo(this.Parent!.Position) > _MAX_TARGET_DISTANCE) {
      this.target_ = null;
      return new THREE.Vector3(0, 0, 0);
    }

    if (this.target_.IsDead) {
      this.target_ = null;
      return new THREE.Vector3(0, 0, 0);
    }

    const direction = this.target_.Position.clone().sub(this.Parent!.Position);
    direction.normalize();

    const dist = this.Parent!.Position.distanceTo(this.target_.Position);
    const falloff = sat(dist / 200);

    const forceVector = direction.multiplyScalar(_ATTACK_FORCE * falloff);
    return forceVector;
  }
};