import {THREE} from '../utils/three-defs.ts';

import {Component} from '../engine/entity.ts';
import { AmmoJSController, AmmoJSRigidBody } from './ammojs-component.ts';
import { ThreeJSController } from '../engine/threejs-component.ts';


export class BasicRigidBody extends Component {
  params_: {
    box: THREE.Vector3;
  };
  body_: AmmoJSRigidBody | null = null;
  debug_: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;

  constructor(params: {
                        box: THREE.Vector3;
                      }) {
    super();
    this.params_ = params;
  }

  Destroy() {
    (this.FindEntity('physics')!.GetComponent('AmmoJSController') as AmmoJSController).RemoveRigidBody(this.body_!);
  }

  InitEntity() {
    const pos = this.Parent!.Position;
    const quat = this.Parent!.Quaternion;

    this.body_ = (this.FindEntity('physics')!.GetComponent('AmmoJSController') as AmmoJSController).CreateBox(
        pos, quat, this.params_.box, {name: this.Parent!.Name});
    
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    // this.debug_ = new THREE.Mesh(geometry, material);
    // this.debug_.scale.copy(this.params_.box);
    // this.debug_.position.copy(pos);
    // this.debug_.quaternion.copy(quat);
    // let scene = (this.FindEntity('threejs')!.GetComponent('ThreeJSController')! as ThreeJSController).scene_;
    // scene.add(this.debug_);

    this.Parent!.Attributes!.roughRadius = Math.max(
        this.params_.box.x,
        Math.max(this.params_.box.y, this.params_.box.z));
    this.Broadcast({topic: 'physics.loaded'});
  }

  InitComponent() {
    this.RegisterHandler_('update.position', (m) => { this.OnPosition_(m); });
    this.RegisterHandler_('update.rotation', (m) => { this.OnRotation_(m); });
    this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
  }

  OnCollision_(_) {
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
    const ms = this.body_!.motionState_;
    const t = this.body_!.transform_;
    
    ms.getWorldTransform(t);
    t.setIdentity();
    t.getOrigin().setValue(pos.x, pos.y, pos.z);
    t.getRotation().setValue(quat.x, quat.y, quat.z, quat.w);
    ms.setWorldTransform(t);

    // const origin = pos;
    // this.debug_.position.copy(origin);
    // this.debug_.quaternion.copy(quat);
  }

  Update(_) {
  }
};
