import {THREE} from '../utils/three-defs.ts';

import {ParticleEmitter, ParticleSystem} from "./particle-system.js";
import type { Message, Particle } from '../utils/types.ts';
import {Component, Entity} from "../engine/entity.ts";
import {rand_range} from "../utils/math.ts";
import {RenderComponent} from "../engine/render-component.ts";

class FireFXEmitter extends ParticleEmitter {
  offset_: THREE.Vector3;
  parent_: Entity;
  blend_: number;
  isBoost: boolean;

  constructor(offset: THREE.Vector3, parent: Entity) {
    super();
    this.offset_ = offset;
    this.parent_ = parent;
    this.blend_ = 0.0;
    this.isBoost = false;
  }

  OnUpdate_() {
  }

  AddParticles(num: number) {
    for (let i = 0; i < num; ++i) {
      this.particles_.push(this.CreateParticle_());
    }
  }

  SetBoost(isBoost:boolean) {
    this.isBoost = isBoost;
  }

  CreateParticle_() : Particle {
    let life = rand_range(0.03, 0.2);
    if (this.isBoost)
        life += 1.0;

    return {
        position: this.offset_.clone(),
        size: rand_range(0.5, 1.0),
        colour: new THREE.Color(),
        alpha: 1.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: new THREE.Vector3(0, 0, 10),
        blend: this.blend_,
        drag: 1.0,
    };
  }
};


export class XWingEffects extends Component {
  blasterFX_: ParticleSystem | null;
  offsets_: THREE.Vector3[];
  offsetIndex_: number;
  params_: {
    camera: THREE.Camera;
    scene: THREE.Scene;
    offset: THREE.Vector3;
  };

  constructor(params: {
                        camera: THREE.Camera;
                        scene: THREE.Scene;
                        offset: THREE.Vector3;
                      }) {
    super();
    this.params_ = params;
  }

  InitEntity() {

    const group = (this.GetComponent('RenderComponent') as RenderComponent).group_;
    this.blasterFX_ = new ParticleSystem({
        camera: this.params_.camera,
        parent: group,
        texture: '/resources/textures/fx/fire.png',
    });

    const x = 0.8 * 4;
    const y1 = 1.65 * 4;
    const y2 = -0.75 * 4;
    const z = -2.7 * 4;
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

    this.SetupFireFX_();
  }

  InitComponent(): void {
    this.RegisterHandler_('player.boost_update', (msg: Message<boolean>) => { this.OnBoost_(msg.value!); });
  }

  OnBoost_(isBoost: boolean) {
    for (let i = 0; i < this.blasterFX_!.emitters_.length; ++i) {
      const emitter = this.blasterFX_!.emitters_[i] as FireFXEmitter;
      emitter.SetBoost(isBoost);
    }
    // console.log('BOOST FX: ', isBoost);
  }

  Destroy() {
    this.blasterFX_!.Destroy();
    this.blasterFX_ = null;
  }

  SetupFireFX_() {
    for (let i = 0; i < 4; ++i) {
      const emitter = new FireFXEmitter(this.offsets_[i], this.Parent!);
      emitter.alphaSpline_.AddPoint(0.0, 0.0);
      emitter.alphaSpline_.AddPoint(0.7, 1.0);
      emitter.alphaSpline_.AddPoint(1.0, 0.0);
      
      
      // emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x1100ff));
      // emitter.colourSpline_.AddPoint(0.5, new THREE.Color(0xffffff));
      emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0xbb2909));
      emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x555555));
      
      emitter.sizeSpline_.AddPoint(0.0, 0.5);
      emitter.sizeSpline_.AddPoint(0.25, 2.0);
      emitter.sizeSpline_.AddPoint(0.75, 0.5);
      emitter.sizeSpline_.AddPoint(1.0, 0.25);

      emitter.SetEmissionRate(500);
      emitter.blend_ = 0.0;  
      this.blasterFX_!.AddEmitter(emitter);
      emitter.AddParticles(10);
    }
  }

  Update(timeElapsed: number) {
    this.blasterFX_!.Update(timeElapsed);
  }
}


