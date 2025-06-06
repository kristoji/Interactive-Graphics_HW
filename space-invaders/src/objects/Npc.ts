// TODO:
// - add to scene
// - shoot to him
// - make him move and shoot

import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { BasicInput } from '../components/Controller';


export class NPCController {
  private _scene: THREE.Scene;
  private _decceleration: THREE.Vector3;
  private _acceleration: THREE.Vector3;
  private _velocity: THREE.Vector3;
  private _position: THREE.Vector3;
  private _input: BasicInput;
  private _target: THREE.Object3D | null = null;
  private _angularAccelerationY: number;
  private _angularDecelerationY: number;

  constructor(params: {modelName: string, color: string, position: THREE.Vector3, scene: THREE.Scene}) {
    this._scene = params.scene;
    // this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    // this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._decceleration = new THREE.Vector3(-0.0005, -2.5, -5.0);
    this._acceleration = new THREE.Vector3(1, 10, 100.0);
    this._angularAccelerationY = 0.25;
    this._angularDecelerationY = -0.0001;
    
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._position = params.position.clone();
    this._input = new BasicInput();

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
            object.position.copy(this._position);
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


    _FindIntersections(pos) {
      const _IsAlive = (c) => {
        const h = c.entity.GetComponent('HealthComponent');
        if (!h) {
          return true;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(2).filter(e => _IsAlive(e));
      const collisions = [];

      for (let i = 0; i < nearby.length; ++i) {
        const e = nearby[i].entity;
        const d = ((pos.x - e._position.x) ** 2 + (pos.z - e._position.z) ** 2) ** 0.5;

        // HARDCODED
        if (d <= 4) {
          collisions.push(nearby[i].entity);
        }
      }
      return collisions;
    }

    _FindPlayer() {
      const _IsAlivePlayer = (c) => {
        const h = c.entity.GetComponent('HealthComponent');
        if (!h) {
          return false;
        }
        if (c.entity.Name != 'player') {
          return false;
        }
        return h._health > 0;
      };

      const grid = this.GetComponent('SpatialGridController');
      const nearby = grid.FindNearbyEntities(100).filter(c => _IsAlivePlayer(c));

      if (nearby.length == 0) {
        return new THREE.Vector3(0, 0, 0);
      }

      const dir = this._parent._position.clone();
      dir.sub(nearby[0].entity._position);
      dir.y = 0.0;
      dir.normalize();

      return dir;
    }

  _OnAIWalk(timeInSeconds: number) {
      const dirToPlayer = this._FindPlayer();

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
  
      this._input._keys.forward = false;

      const acc = this._acceleration;
      if (dirToPlayer.length() == 0) {
        return;
      }

      this._input._keys.forward = true;
      velocity.z += acc.z * timeInSeconds;

      const m = new THREE.Matrix4();
      m.lookAt(
          new THREE.Vector3(0, 0, 0),
          dirToPlayer,
          new THREE.Vector3(0, 1, 0));
      _R.setFromRotationMatrix(m);
  
      controlObject.quaternion.copy(_R);
  
      const oldPosition = new THREE.Vector3();
      oldPosition.copy(controlObject.position);
  
      const forward = new THREE.Vector3(0, 0, 1);
      forward.applyQuaternion(controlObject.quaternion);
      forward.normalize();
  
      const sideways = new THREE.Vector3(1, 0, 0);
      sideways.applyQuaternion(controlObject.quaternion);
      sideways.normalize();
  
      sideways.multiplyScalar(velocity.x * timeInSeconds);
      forward.multiplyScalar(velocity.z * timeInSeconds);
  
      const pos = controlObject.position.clone();
      pos.add(forward);
      pos.add(sideways);

      const collisions = this._FindIntersections(pos);
      if (collisions.length > 0) {
        this._input._keys.space = true;
        this._input._keys.forward = false;
        return;
      }

      controlObject.position.copy(pos);
      this._position.copy(pos);
  
      this._parent.SetPosition(this._position);
      this._parent.SetQuaternion(this._target.quaternion);
  }
}
  // class NPCController {
  //   constructor(params) {
  //     super();
  //     this._Init(params);
  //   }

  //   _Init(params) {
  //     this._params = params;
  //     this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
  //     this._acceleration = new THREE.Vector3(1, 0.25, 40.0);
  //     this._velocity = new THREE.Vector3(0, 0, 0);
  //     this._position = new THREE.Vector3();

  //     this._animations = {};
  //     this._input = new AIInput();

  //     this._LoadModels();
  //   }

    // InitComponent() {
    //   this._RegisterHandler('health.death', (m) => { this._OnDeath(m); });
    //   this._RegisterHandler('update.position', (m) => { this._OnPosition(m); });
    // }

    // _OnDeath(msg) {
    //   this._stateMachine.SetState('death');
    // }

    // _OnPosition(m) {
    //   if (this._target) {
    //     this._target.position.copy(m.value);
    //     this._target.position.y = 0.35;
    //   }
    // }
    


  //   _UpdateAI(timeInSeconds) {
  //     const currentState = this._stateMachine._currentState;
  //     if (currentState.Name != 'walk' &&
  //         currentState.Name != 'run' &&
  //         currentState.Name != 'idle') {
  //       return;
  //     }

  //     if (currentState.Name == 'death') {
  //       return;
  //     }

  //     if (currentState.Name == 'idle' ||
  //         currentState.Name == 'walk') {
  //       this._OnAIWalk(timeInSeconds);
  //     }
  //   }

    

  //   Update(timeInSeconds) {

  //     this._input._keys.space = false;
  //     this._input._keys.forward = false;

  //     this._UpdateAI(timeInSeconds);


  //     // HARDCODED
  //     if (this._stateMachine._currentState._action) {
  //       this.Broadcast({
  //         topic: 'player.action',
  //         action: this._stateMachine._currentState.Name,
  //         time: this._stateMachine._currentState._action.time,
  //       });
  //     }
      
  //     if (this._mixer) {
  //       this._mixer.update(timeInSeconds);
  //     }
  //   }
  // };