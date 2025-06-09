import {THREE} from '../utils/three-defs.ts';

import {ParticleEmitter, ParticleSystem} from "./particle-system.js";
import type {Particle} from '../utils/types.ts';


export class ShootFlashFXEmitter extends ParticleEmitter {
  offset_: THREE.Vector3;
  parent_: THREE.Group;
  blend_: number;
  light_: THREE.PointLight | null;
  life_: number;
  maxLife_: number;

  constructor(offset: THREE.Vector3, parent: THREE.Group) {
    super();
    this.offset_ = offset;
    this.parent_ = parent;
    this.blend_ = 0.0;
    this.light_ = null;
    this.life_ = 1.0;
    this.maxLife_ = 1.0;
  }

  OnDestroy() {
    this.light_!.parent!.remove(this.light_!);
  }

  OnUpdate_(timeElapsed: number) {
    if (!this.light_) {
      return;
    }
    this.life_ = Math.max(0.0, this.life_ - timeElapsed);
    this.light_.intensity = 20.0 * (this.life_ / this.maxLife_);
  }

  AddParticles(num: number) {
    for (let i = 0; i < num; ++i) {
      this.particles_.push(this.CreateParticle_());
    }
  }

  CreateParticle_() : Particle{
    const origin = this.offset_.clone();

    const life = 0.2;
    const p = origin;

    const d = new THREE.Vector3(0, 0, 0);

    // DEMO
    this.light_ = new THREE.PointLight(0xFF8080, 20.0, 20.0, 2.0);
    this.light_.position.copy(origin);
    this.life_ = life;
    this.maxLife_ = life;
    this.parent_.add(this.light_);

    return {
        position: p,
        size: 2.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
        blend: this.blend_,
        drag: 1.0,
    };
  }
};
