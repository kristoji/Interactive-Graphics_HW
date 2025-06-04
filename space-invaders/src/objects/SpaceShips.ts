import * as THREE from 'three';
import { BasicCharacterControllerInput } from '../components/Controller';
import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';


export class BasicCharacterController {
  private _scene: THREE.Scene;
  private _decceleration: THREE.Vector3;
  private _acceleration: THREE.Vector3;
  private _velocity: THREE.Vector3;
  private _position: THREE.Vector3;
  private _input: BasicCharacterControllerInput;
  private _target: THREE.Object3D | null = null;
  private _angularAccelerationY: number;
  private _angularDecelerationY: number;

  constructor(params: {modelName: string, color: string, scene: THREE.Scene}) {
    this._scene = params.scene;
    // this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    // this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._decceleration = new THREE.Vector3(-0.0005, -2.5, -5.0);
    this._acceleration = new THREE.Vector3(1, 10, 100.0);
    this._angularAccelerationY = 0.25;
    this._angularDecelerationY = -0.0001;
    
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._position = new THREE.Vector3();
    this._input = new BasicCharacterControllerInput();

    this._LoadModels(params.modelName, params.color);
  }

  _LoadModels(modelName: string, color: string) {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('/models/' + modelName + '/OBJ/');
    mtlLoader.load(modelName + '.mtl', (materials) => {
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/' + modelName + '/OBJ/');
        objLoader.load(modelName + '.obj', (object) => {
            this._target = object;
            // Optional: replace texture manually if .mtl is generic
            const textureLoader = new THREE.TextureLoader();
            // '/models/Bob/Textures/Bob_Blue.png'
            const texture = textureLoader.load('/models/' + modelName + '/Textures/' + modelName + '_' + color + '.png');
            if (!texture) {
                console.error('Failed to load texture for model:', modelName);
            }
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });

            object.castShadow = true;
            object.receiveShadow = true;
            
            this._scene.add(this._target);
            object.rotation.y = Math.PI;
            object.position.set(0, 30,0);
        });
    });
  }

  get Position() {
    return this._position;
  }

  get Rotation() {
    if (!this._target) {
      return new THREE.Quaternion();
    }
    return this._target.quaternion;
  }

  Update(timeInSeconds: number) {
    // if (!this._stateMachine._currentState) {
    //   return;
    // }

    // this._stateMachine.Update(timeInSeconds, this._input);
    if (!this._target) {
      return;
    }

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
        velocity.x * this._decceleration.x,
        velocity.y * this._decceleration.y,
        velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
        Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input.keys.shift) {
      acc.multiplyScalar(2.0);
    }

    // if (this._stateMachine._currentState.Name == 'dance') {
    //   acc.multiplyScalar(0.0);
    // }

    if (this._input.keys.forward) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input.keys.backward) {
      velocity.z -= acc.z * timeInSeconds;
    }
    if (this._input.keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._angularAccelerationY);
      _R.multiply(_Q);
    }
    if (this._input.keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._angularAccelerationY);
      _R.multiply(_Q);
    }
    if (this._input.keys.space) {
      velocity.y += acc.y * timeInSeconds;
    }
    if (this._input.keys.shift) {
      velocity.y -= acc.y * timeInSeconds;
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(controlObject.quaternion);
    up.normalize();

    sideways.multiplyScalar(velocity.x * timeInSeconds);
    forward.multiplyScalar(velocity.z * timeInSeconds);
    up.multiplyScalar(velocity.y * timeInSeconds);


    controlObject.position.add(forward);
    controlObject.position.add(sideways);
    controlObject.position.add(up);

    this._position.copy(controlObject.position);

    // if (this._mixer) {
    //   this._mixer.update(timeInSeconds);
    // }
  }
};
