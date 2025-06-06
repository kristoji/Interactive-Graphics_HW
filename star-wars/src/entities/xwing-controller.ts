import {THREE} from '../utils/three-defs.ts';

import {Component} from '../engine/entity.ts';
import { RenderComponent } from '../engine/render-component.ts';


export class XWingController extends Component {
  params_: {
    camera: THREE.Camera;
    blasterStrength: number;
    offset: THREE.Vector3;
  };
  cooldownTimer_: number;
  cooldownRate_: number;
  powerLevel_: number;
  offsets_: THREE.Vector3[];
  offsetIndex_: number;
  shots_: never[];
  spotlight_: THREE.SpotLight;

  
  constructor(params : {
                        camera: THREE.Camera;
                        blasterStrength: number;
                        offset: THREE.Vector3;
                      }) {
    super();
    this.params_ = params;
    this.cooldownTimer_ = 0.0;
    this.cooldownRate_ = 0.075;
    this.powerLevel_ = 0.0;

    const x = 2.35 * 4;
    const y1 = 1.95 * 4;
    const y2 = -0.5 * 4;
    const z = 0.65 * 4;
    this.offsets_ = [
        new THREE.Vector3(-x, y1, -z),
        new THREE.Vector3(x, y1, -z),
        new THREE.Vector3(-x, -y2, -z),
        new THREE.Vector3(x, -y2, -z),
    ];
    for (let i = 0; i < this.offsets_.length; ++i) {
      this.offsets_[i].add(this.params_.offset);
    }
    this.offsetIndex_ = 0;
    this.shots_ = [];
  }

  Destroy() {
    // this.blasterFX_.Destroy();
    // this.blasterFX_ = null;
  }

  InitComponent() {
    // this.RegisterHandler_('player.fire', (m) => this.OnFire_(m));
  }

  InitEntity() {
    const group = (this.GetComponent('RenderComponent')! as RenderComponent).group_;
    // this.blasterFX_ = new particle_system.ParticleSystem({
    //     camera: this.params_.camera,
    //     parent: group,
    //     texture: './resources/textures/fx/blaster.jpg',
    // });

    this.spotlight_ = new THREE.SpotLight(
        0xFFFFFF, 5.0, 200, Math.PI / 2, 0.5);
    this.spotlight_.position.set(0, 0, -5);
    this.spotlight_.target.position.set(0, 0, -6);

    group.add(this.spotlight_);
    group.add(this.spotlight_.target);
  }


  Update(timeElapsed: number) {
    this.cooldownTimer_ = Math.max(this.cooldownTimer_ - timeElapsed, 0.0);
    this.powerLevel_ = Math.min(this.powerLevel_ + timeElapsed, 4.0);

    // this.blasterFX_.Update(timeElapsed);

    // this.UpdateShots_();
  }
};
