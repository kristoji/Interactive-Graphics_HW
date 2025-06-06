import {THREE} from '../utils/three-defs.js';

import {Component} from '../engine/entity.ts';



export class TieFighterController extends Component {
  
  params_: { camera: THREE.Camera; scene: THREE.Scene; blasterStrength: number; };
  cooldownTimer_: number = 0.0;
  cooldownRate_: number = 0.1;
  powerLevel_: number = 0.0;
  offsets_: THREE.Vector3[];
  shots_: [];
  offsetIndex_: number;

  constructor(params: { 
                        camera: THREE.Camera,
                        scene: THREE.Scene,
                        blasterStrength: number,
                      }
              ) {

    super();
    this.params_ = params;

    const x = 0.6 * 4;
    const y1 = 0.0  * 4;
    const z = 0.8 * 4;
    this.offsets_ = [
        new THREE.Vector3(-x, y1, -z),
        new THREE.Vector3(x, y1, -z),
    ];
    this.shots_ = [];
    this.offsetIndex_ = 0;
  }

  Destroy() {
  }

  InitComponent() {
    // this.RegisterHandler_('player.fire', () => this.OnFire_());
  }

  InitEntity() {

  }


  Update(timeElapsed: number) {
    // this.cooldownTimer_ = Math.max(this.cooldownTimer_ - timeElapsed, 0.0);
    // this.powerLevel_ = Math.min(this.powerLevel_ + timeElapsed, 4.0);

    // this.UpdateShots_();
  }
};
