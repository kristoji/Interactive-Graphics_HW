import {THREE} from '../utils/three-defs.js';

import {Component, Entity} from '../engine/entity.ts';
import { SpatialGridController } from '../engine/spatial-grid-controller.ts';



export class TieFighterController extends Component {
  
  params_: { camera: THREE.Camera; scene: THREE.Scene; blasterStrength: number; };
  cooldownTimer_: number = 0.0;
  cooldownRate_: number = 0.1;
  powerLevel_: number = 0.0;
  offsets_: THREE.Vector3[];
  shots_: [];
  offsetIndex_: number;
  grid_: SpatialGridController | null = null;

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
  }

  InitEntity() {
    this.grid_ = this.Parent!.GetComponent('SpatialGridController') as SpatialGridController;
    
  }

  CheckCollisions_() {
    const potentialList = this.grid_!.FindNearbyEntities(50);
    if (potentialList.length == 0) {
      return;
    }
    const _P = new THREE.Vector3();

    for (const c of potentialList) {
      const e = c.entity as Entity;
      _P.copy(e.Position);
      let dist = _P.distanceTo(this.Parent!.Position);

      let other_radius = e.Attributes!.roughRadius!;
      let this_radius = this.Parent!.Attributes!.roughRadius!;
      if (dist > (other_radius + this_radius)) {
        continue; // Too far away
      }
      this.Parent!.Broadcast({topic: 'physics.collision'});
      e.Broadcast({topic: 'physics.collision'});

    }
  }

  Update(timeElapsed: number) {
    this.CheckCollisions_();
  }
};
