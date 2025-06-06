import {THREE} from '../utils/three-defs.ts';

import {Component} from '../engine/entity.ts';
import {clamp} from '../utils/math.ts';
import { EntityManager } from '../engine/entity-manager.ts';


export class PlayerController extends Component {
  dead_: boolean = false;
  decceleration_: THREE.Vector3;
  acceleration_: THREE.Vector3;
  velocity_: THREE.Vector3;


  constructor() {
    super();
  }

  InitComponent() {
    // this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
  }

  InitEntity() {
    this.decceleration_ = new THREE.Vector3(-0.0005, -0.0001, -1);
    this.acceleration_ = new THREE.Vector3(100, 0.5, 25000);
    this.velocity_ = new THREE.Vector3(0, 0, 0);
  }

  // OnCollision_() {
  //   if (!this.dead_) {
  //     this.dead_ = true;
  //     console.log('EXPLODE ' + this.Parent!.Name);
  //     this.Broadcast({topic: 'health.dead'});
  //   }
  // }

  // Fire_() {
  //   this.Broadcast({
  //       topic: 'player.fire'
  //   });
  // }

  Update(timeInSeconds: number) {
    if (this.dead_) {
      return;
    }

    const input = this.Parent!.Attributes!.InputCurrent;
    if (!input) {
      return;
    }

    const velocity = this.velocity_;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this.decceleration_.x,
        velocity.y * this.decceleration_.y,
        velocity.z * this.decceleration_.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);

    velocity.add(frameDecceleration);
    velocity.z = -clamp(Math.abs(velocity.z), 50.0, 125.0);

    const _PARENT_Q = this.Parent!.Quaternion.clone();
    const _PARENT_P = this.Parent!.Position.clone();

    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = _PARENT_Q.clone();

    const acc = this.acceleration_.clone();
    if (input.shift) {
      acc.multiplyScalar(2.0);
    }

    if (input.axis1Forward) {
      _A.set(1, 0, 0);
      _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * acc.y * input.axis1Forward);
      _R.multiply(_Q);
    }
    if (input.axis1Side) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * acc.y * input.axis1Side);
      _R.multiply(_Q);
    }
    if (input.axis2Side) {
      _A.set(0, 0, -1);
      _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * acc.y * input.axis2Side);
      _R.multiply(_Q);
    }

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(_PARENT_Q);
    forward.normalize();

    const updown = new THREE.Vector3(0, 1, 0);
    updown.applyQuaternion(_PARENT_Q);
    updown.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(_PARENT_Q);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    updown.multiplyScalar(velocity.y * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);

    const pos = _PARENT_P;
    pos.add(forward);
    pos.add(sideways);
    pos.add(updown);

    this.Parent!.SetPosition(pos);
    this.Parent!.SetQuaternion(_R);

    // if (input.space) {
    //   this.Fire_();
    // }
  }
};
