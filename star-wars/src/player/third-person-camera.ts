import {THREE} from '../utils/three-defs.ts';

import {Component, Entity} from '../engine/entity.ts';


export class ThirdPersonCamera extends Component {
  name = 'ThirdPersonCamera';
  params_: {
    camera: THREE.Camera;
    target: Entity;
  };
  camera_: THREE.Camera;
  currentPosition_: THREE.Vector3;

  constructor(params : {
                          camera: THREE.Camera;
                          target: Entity;
                        }) {
    super();

    this.params_ = params;
    this.camera_ = params.camera;

    this.currentPosition_ = new THREE.Vector3();
    this.camera_.setRotationFromQuaternion(params.target.Quaternion.clone());
    this.SetPass(1);
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(0, 10, 20);
    const input = this.Parent!.Attributes!.InputCurrent!;
    if (!input) {
      return idealOffset;
    }

    if (input.axis1Side) {
      idealOffset.lerp(
          new THREE.Vector3(10 * input.axis1Side, 5, 20), Math.abs(input.axis1Side));
    }
    
    if (input.axis1Forward < 0) {
      idealOffset.lerp(
        new THREE.Vector3(0, 0, 18 * -input.axis1Forward), Math.abs(input.axis1Forward));
    }

    if (input.axis1Forward > 0) {
      idealOffset.lerp(
        new THREE.Vector3(0, 5, 15 * input.axis1Forward), Math.abs(input.axis1Forward));
    }

    idealOffset.applyQuaternion(this.params_.target.Quaternion);
    idealOffset.add(this.params_.target.Position);

    return idealOffset;
  }

  Update(timeElapsed) {
    const idealOffset = this._CalculateIdealOffset();

    const t1 = 1.0 - Math.pow(0.05, timeElapsed);
    const t2 = 1.0 - Math.pow(0.01, timeElapsed);

    this.currentPosition_.lerp(idealOffset, t1);

    this.camera_.position.copy(this.currentPosition_);
    this.camera_.quaternion.slerp(this.params_.target.Quaternion, t2);
  }
}
