import * as THREE from 'three';
import { BasicCharacterController } from '../objects/SpaceShips';


export class ThirdPersonCamera {
  private idealOffset = new THREE.Vector3(-5, 7, -13);
  private idealLookat = new THREE.Vector3(0, 2.5, 30);
  private _camera: THREE.PerspectiveCamera;
  private _currentPosition: THREE.Vector3;
  private _currentLookat: THREE.Vector3;
  private _target: BasicCharacterController;

  constructor(params: { camera: THREE.PerspectiveCamera; target: BasicCharacterController; }) {
    this._camera = params.camera;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
    this._target = params.target;

  }

  _CalculateIdealOffset() {
    const c_idealOffset = this.idealOffset.clone();
    c_idealOffset.applyQuaternion(this._target.Rotation);
    c_idealOffset.add(this._target.Position);
    return c_idealOffset;
  }

  _CalculateIdealLookat() {
    const c_idealLookat = this.idealLookat.clone();
    c_idealLookat.applyQuaternion(this._target.Rotation);
    c_idealLookat.add(this._target.Position);
    return c_idealLookat;
  }

  Update(timeElapsed: number) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}
