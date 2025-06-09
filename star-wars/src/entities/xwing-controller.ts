import {THREE} from '../utils/three-defs.ts';
import {Bullet, Hit} from '../utils/types.ts';

import {Component} from '../engine/entity.ts';
import { RenderComponent } from '../engine/render-component.ts';
import { ParticleSystem } from '../effects/particle-system.ts';
import { BlasterSystem } from '../effects/blaster.ts';
import { LoadController } from '../engine/load-controller.ts';
import { ShootFlashFXEmitter } from '../effects/flash-effect.ts';
import { AmmoJSController } from '../physics/ammojs-component.ts';
import { TinyExplosionSpawner } from '../engine/spawners.ts';


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
  shots_: Bullet[];
  spotlight_: THREE.SpotLight;
  blasterFX_: ParticleSystem | null = null;

  
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
    const group = (this.GetComponent('RenderComponent')! as RenderComponent).group_;
    this.blasterFX_ = new ParticleSystem({
        camera: this.params_.camera,
        parent: group,
        texture: './resources/textures/fx/blaster.jpg',
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

    // const loader = this.FindEntity('loader')!.GetComponent('LoadController') as LoadController;
    // loader.LoadSound('./resources/sounds/', 'laser.ogg', (s) => {
    //   const group = this.GetComponent('RenderComponent').group_;
    //   group.add(s);
    //   s.play();  
    // });
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

    const physics = this.FindEntity('physics')!.GetComponent('AmmoJSController') as AmmoJSController;
    for (let s of this.shots_) {
      const hits = physics.RayTest(s.Start, s.End);
      for (let h of hits) {
        if (h.name == this.Parent!.Name) {
          continue;
        }
        const e = this.FindEntity(h.name)!;
        e.Broadcast<Hit>({topic: 'player.hit', value: {
                                                        dmg: this.params_.blasterStrength,
                                                        pos: h.position}
                                                      });
        s.Life = 0.0;
        // console.log('HIT ' + e.Name + ' with blaster shot from ' + this.Parent!.Name);

        // const explosion = this.FindEntity('spawners')!.GetComponent('TinyExplosionSpawner') as TinyExplosionSpawner;
        // explosion.Spawn(h.position);    
      }
    }
  }


  Update(timeElapsed: number) {
    this.cooldownTimer_ = Math.max(this.cooldownTimer_ - timeElapsed, 0.0);
    this.powerLevel_ = Math.min(this.powerLevel_ + timeElapsed, 4.0);

    this.blasterFX_!.Update(timeElapsed);
    this.UpdateShots_();
  }
};
