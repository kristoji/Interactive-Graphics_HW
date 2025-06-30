import {THREE} from '../utils/three-defs.ts';
import {Bullet, Hit} from '../utils/types.ts';

import {Component, Entity} from '../engine/entity.ts';
import { RenderComponent } from '../engine/render-component.ts';
import { ParticleSystem } from '../effects/particle-system.ts';
import { BlasterSystem } from '../effects/blaster.ts';
import { LoadController } from '../engine/load-controller.ts';
import { ShootFlashFXEmitter } from '../effects/flash-effect.ts';
import { TinyExplosionSpawner } from '../engine/spawners.ts';
import { SpatialGridController } from '../engine/spatial-grid-controller.ts';


export class XWingController extends Component {
  name = 'XWingController';
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
  shots_: Bullet[];
  spotlight_: THREE.SpotLight;
  blasterFX_: ParticleSystem | null = null;
  grid_: SpatialGridController | null = null;

  
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
    this.blasterFX_!.Destroy();
    this.blasterFX_ = null;
  }

  InitComponent() {
    this.RegisterHandler_('player.fire', () => this.OnFire_());
  }

  InitEntity() {
    this.grid_ = this.Parent!.GetComponent('SpatialGridController') as SpatialGridController;
    const group = (this.GetComponent('RenderComponent')! as RenderComponent).group_;
    this.blasterFX_ = new ParticleSystem({
        camera: this.params_.camera,
        parent: group,
        texture: '/resources/textures/fx/blaster.jpg',
    });

    this.spotlight_ = new THREE.SpotLight(
        0xFFFFFF, 5.0, 200, Math.PI / 2, 0.5);
    this.spotlight_.position.set(0, 0, -5);
    this.spotlight_.target.position.set(0, 0, -6);

    group.add(this.spotlight_);
    group.add(this.spotlight_.target);
  }


  OnFire_() {
    if (this.cooldownTimer_ > 0.0) {
      return;
    }

    if (this.powerLevel_ < 0.2) {
      return;
    }

    this.powerLevel_ = Math.max(this.powerLevel_ - 0.2, 0.0);

    this.cooldownTimer_ = this.cooldownRate_;
    this.offsetIndex_ = (this.offsetIndex_ + 1) % this.offsets_.length;

    const fx = this.FindEntity('fx')!.GetComponent('BlasterSystem') as BlasterSystem;

    const start = this.offsets_[this.offsetIndex_].clone();
    start.applyQuaternion(this.Parent!.Quaternion);
    start.add(this.Parent!.Position);
    
    const b: Bullet = {
      Start: start,
      End: start.clone(),
      Velocity: this.Parent!.Forward.clone().multiplyScalar(2000.0),
      Length: 50.0,
      Width: 2.5,
      Life: 5.0,
      TotalLife: 5.0,
      Size: 1.0,
      Alive: true,
      Colours: [
        new THREE.Color(4.0, 0.5, 0.5), new THREE.Color(0.0, 0.0, 0.0)
      ]
    }
    fx.AddParticle(b);
    this.shots_.push(b);
    this.SetupFlashFX_(this.offsetIndex_);
  }

  SetupFlashFX_(index: number) {
    const group = (this.GetComponent('RenderComponent')! as RenderComponent).group_;
    const emitter = new ShootFlashFXEmitter(this.offsets_[index], group);
    emitter.alphaSpline_.AddPoint(0.0, 0.0);
    emitter.alphaSpline_.AddPoint(0.5, 1.0);
    emitter.alphaSpline_.AddPoint(1.0, 0.0);
    
    emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0xFF4040));
    emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0xA86A4F));
    
    emitter.sizeSpline_.AddPoint(0.0, 0.5);
    emitter.sizeSpline_.AddPoint(0.25, 2.0);
    emitter.sizeSpline_.AddPoint(1.0, 0.25);
    emitter.SetEmissionRate(0);
    emitter.blend_ = 0.0;  
    this.blasterFX_!.AddEmitter(emitter);
    emitter.AddParticles(1);
  }


  UpdateShots_() {
    this.shots_ = this.shots_.filter(p => {
      return p.Life > 0.0;
    });
    const _R = new THREE.Ray();
    const _M = new THREE.Vector3();
    const _S = new THREE.Sphere();
    const _C = new THREE.Vector3();

    for (let p of this.shots_) {

      // Find intersections
      _R.direction.copy(p.Velocity);
      _R.direction.normalize();
      _R.origin.copy(p.Start);

      const blasterLength = p.End.distanceTo(p.Start);
      _M.addVectors(p.Start, p.End);
      _M.multiplyScalar(0.5);

      // Find from _M (instead of this.pos) requires grid.grid 
      const potentialList = this.grid_!.grid_.FindNear([_M.x, _M.z], [blasterLength, blasterLength]);

      if (potentialList.length == 0) {
        continue;
      }

      for (let candidate of potentialList) {
        let e = candidate.entity as Entity;
        _S.center.copy(e.Position);
        _S.radius = e.Attributes!.roughRadius!;

        if (!_R.intersectSphere(_S, _C)) {
          continue;
        }

        if (_C.distanceTo(p.Start) > blasterLength) {
          continue;
        }

        p.Alive = false;
        p.Life = 0.0; 
        e.Broadcast<Hit>({topic: 'player.hit', value: {
                                                        dmg: this.params_.blasterStrength,
                                                        pos: _C}
                                                      });
        break;
      }
    }
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
    this.cooldownTimer_ = Math.max(this.cooldownTimer_ - timeElapsed, 0.0);
    this.powerLevel_ = Math.min(this.powerLevel_ + timeElapsed, 4.0);

    this.blasterFX_!.Update(timeElapsed);
    this.UpdateShots_();
    this.CheckCollisions_();
  }
};
