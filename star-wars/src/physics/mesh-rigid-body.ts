import {THREE} from '../utils/three-defs.ts';

import {Component} from '../engine/entity.ts';
import { AmmoJSController, AmmoJSRigidBody } from './ammojs-component.ts';
import { LoadController } from '../engine/load-controller.ts';

declare const Ammo: any;

export class MeshRigidBody extends Component {
  group_: THREE.Group<THREE.Object3DEventMap>;
  params_: {
    resourcePath: string;
    resourceName: string;
    scale: number;
    scene: THREE.Scene;
  };
  target_: THREE.Object3D | null = null;
  body_: AmmoJSRigidBody | null = null;

  constructor(params: {
                        resourcePath: string;
                        resourceName: string;
                        scale: number;
                        scene: THREE.Scene;
                      }) {
    super();
    this.group_ = new THREE.Group();
    this.params_ = params;
    // this.params_.scene.add(this.group_);
  }

  Destroy() {
    this.group_.traverse(c => {
      if (!(c instanceof THREE.Mesh)) {
        return;
      }
      if (c.material) {
        c.material.dispose();
      }
      if (c.geometry) {
        c.geometry.dispose();
      }
    });
    this.params_.scene.remove(this.group_);
    (this.FindEntity('physics')!.GetComponent('AmmoJSController') as AmmoJSController).RemoveRigidBody(this.body_!);
  }

  InitEntity() {
    this._LoadModels();
  }

  _LoadModels() {
    const loader = this.FindEntity('loader')!.GetComponent('LoadController') as LoadController;
    loader.Load(
        this.params_.resourcePath, this.params_.resourceName, (mdl) => {
      this._OnLoaded(mdl);
    });
  }

  _OnLoaded(obj: THREE.Object3D) {
    this.target_ = obj;
    this.group_.add(this.target_);
    this.group_.position.copy(this.Parent!.Position);
    this.group_.quaternion.copy(this.Parent!.Quaternion);

    this.target_.scale.setScalar(this.params_.scale);
    this.target_.traverse(c => {
      if (!(c instanceof THREE.Mesh)) {
        return;
      }
      if (c.geometry) {
        c.geometry.computeBoundingBox();
      }
    });

    this.Broadcast({
        topic: 'loaded.collision',
        value: this.target_,
    });
  }

  OnMeshLoaded_(msg: {topic: string, value: THREE.Object3D}) {
    const target = msg.value;
    const pos = this.Parent!.Position;
    const quat = this.Parent!.Quaternion;

    this.body_ = (this.FindEntity('physics')!.GetComponent('AmmoJSController') as AmmoJSController).CreateMesh(
        target, pos, quat, {name: this.Parent!.Name});

    const s = new THREE.Sphere();
    const b = new THREE.Box3().setFromObject(target);
    b.getBoundingSphere(s);
    this.Parent!.Attributes!.roughRadius = s.radius;

    this.OnTransformChanged_();
    this.Broadcast({topic: 'physics.loaded'});
  }

  InitComponent() {
    this.RegisterHandler_('loaded.collision', (m) => this.OnMeshLoaded_(m) );
    this.RegisterHandler_('update.position', (m) => { this.OnPosition_(m); });
    this.RegisterHandler_('update.rotation', (m) => { this.OnRotation_(m); });
  }

  OnPosition_(m) {
    this.OnTransformChanged_();
  }

  OnRotation_(m) {
    this.OnTransformChanged_();
  }

  OnTransformChanged_() {
    const pos = this.Parent!.Position;
    const quat = this.Parent!.Quaternion;
    const ms = this.body_!.body_.getMotionState();

    const t = new Ammo.btTransform();
    t.setIdentity();
    t.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    t.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    ms.setWorldTransform(t);
  }

  Update(_) {
  }
};