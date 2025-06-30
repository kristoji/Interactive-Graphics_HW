import {THREE} from '../utils/three-defs.ts';

import {Component} from "../engine/entity.ts";

import {ParticleEmitter, ParticleSystem} from "./particle-system.js";
import type {Particle} from '../utils/types.ts';
import {rand_range} from '../utils/math.ts';

export class ExplosionEffectEmitter extends ParticleEmitter {
  origin_: THREE.Vector3;
  blend_: number;

  constructor(origin: THREE.Vector3) {
    super();
    this.origin_ = origin.clone();
    this.blend_ = 0.0;
  }

  OnUpdate_() {
  }

  AddParticles(num: number) {
    for (let i = 0; i < num; ++i) {
      this.particles_.push(this.CreateParticle_());
    }
  }

  CreateParticle_() {
    const radius = 1.0;
    const life = rand_range(0.5, 1.0);
    const p = new THREE.Vector3(
      rand_range(-radius, radius),
      rand_range(-radius, radius),
      rand_range(-radius, radius));

    const d = p.clone().normalize();
    p.copy(d);
    p.multiplyScalar(radius);
    p.add(this.origin_);
    d.multiplyScalar(50.0);

    return {
        position: p,
        size: rand_range(2.5, 5.0),
        colour: new THREE.Color(),
        alpha: 0.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
        blend: this.blend_,
        drag: 0.9,
    };
  }
};

export class TinyExplosionEffectEmitter extends ParticleEmitter {
  origin_: THREE.Vector3;
  blend_: number;

  constructor(origin: THREE.Vector3) {
    super();
    this.origin_ = origin.clone();
    this.blend_ = 0.0;
  }

  OnUpdate_() {
  }

  AddParticles(num: number) {
    for (let i = 0; i < num; ++i) {
      this.particles_.push(this.CreateParticle_());
    }
  }

  CreateParticle_() : Particle {
    const radius = 1.0;
    const life = rand_range(0.5, 1.0);
    const p = new THREE.Vector3(
      rand_range(-radius, radius),
      rand_range(-radius, radius),
      rand_range(-radius, radius));

    const d = p.clone().normalize();
    p.copy(d);
    p.multiplyScalar(radius);
    p.add(this.origin_);
    d.multiplyScalar(25.0);

    return {
        position: p,
        size: rand_range(2.5, 5.0),
        colour: new THREE.Color(),
        alpha: 0.0,
        life: life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
        blend: this.blend_,
        drag: 0.75,
    };
  }
};

export class ExplodeEffect extends Component {
  params_: {
    scene: THREE.Scene;
    camera: THREE.Camera;
  }
  group_: THREE.Group;
  particles_: ParticleSystem;
  timer_: number;
  constructor(params: {
                        scene: THREE.Scene;
                        camera: THREE.Camera;
                      }) {
    super();
    this.params_ = params;

    this.group_ = new THREE.Group();
    params.scene.add(this.group_);

    this.particles_ = new ParticleSystem({
        camera: params.camera,
        parent: params.scene,
        texture: '/resources/textures/fx/fire.png',
    });
    this.timer_ = 10.0;
  }

  Destroy() {
    this.particles_.Destroy();
    this.group_.parent!.remove(this.group_);
  }

  InitEntity() {
    this.group_.position.copy(this.Parent!.Position);

    for (let i = 0; i < 3; ++i) {
      const r = 4.0;
      const p = new THREE.Vector3(
                                  rand_range(-r, r),
                                  rand_range(-r, r),
                                  rand_range(-r, r));
      p.add(this.Parent!.Position);

      let emitter = new ExplosionEffectEmitter(p);
      emitter.alphaSpline_.AddPoint(0.0, 0.0);
      emitter.alphaSpline_.AddPoint(0.5, 1.0);
      emitter.alphaSpline_.AddPoint(1.0, 0.0);
      
      emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x800000));
      emitter.colourSpline_.AddPoint(0.3, new THREE.Color(0xFF0000));
      emitter.colourSpline_.AddPoint(0.4, new THREE.Color(0xdeec42)); // green
      emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0xf4a776)); // orange
      
      emitter.sizeSpline_.AddPoint(0.0, 0.5);
      emitter.sizeSpline_.AddPoint(0.5, 3.0);
      emitter.sizeSpline_.AddPoint(1.0, 0.5);
      emitter.blend_ = 0.0;
      emitter.delay_ = i * 0.5;
      emitter.AddParticles(200);

      this.particles_.AddEmitter(emitter);

      emitter = new ExplosionEffectEmitter(p);
      emitter.alphaSpline_.AddPoint(0.0, 0.0);
      emitter.alphaSpline_.AddPoint(0.7, 1.0);
      emitter.alphaSpline_.AddPoint(1.0, 0.0);
      
      emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x000000));
      emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x000000));
      
      emitter.sizeSpline_.AddPoint(0.0, 0.5);
      emitter.sizeSpline_.AddPoint(0.5, 4.0);
      emitter.sizeSpline_.AddPoint(1.0, 4.0);
      emitter.blend_ = 1.0;
      emitter.delay_ = i * 0.5 + 0.25;
      emitter.AddParticles(50);

      this.particles_.AddEmitter(emitter);
    }
  }

  Update(timeElapsed: number) {
    this.particles_.Update(timeElapsed);
    this.timer_ -= timeElapsed;
    if (this.timer_ <= 0) {
      this.Parent!.SetDead();
    }
  }
};

export class TinyExplodeEffect extends Component {
  params_: {
    scene: THREE.Scene;
    camera: THREE.Camera;
  }
  group_: THREE.Group;
  particles_: ParticleSystem;
  timer_: number;

  constructor(params) {
    super();
    this.params_ = params;

    this.group_ = new THREE.Group();
    params.scene.add(this.group_);

    this.particles_ = new ParticleSystem({
        camera: params.camera,
        parent: params.scene,
        texture: '/resources/textures/fx/fire.png',
    });
    this.timer_ = 10.0;
  }

  Destroy() {
    this.particles_.Destroy();
    this.group_.parent!.remove(this.group_);
  }

  InitEntity() {
    this.group_.position.copy(this.Parent!.Position);

    const p = this.Parent!.Position.clone();

    let emitter = new TinyExplosionEffectEmitter(p);
    emitter.alphaSpline_.AddPoint(0.0, 0.0);
    emitter.alphaSpline_.AddPoint(0.5, 1.0);
    emitter.alphaSpline_.AddPoint(1.0, 0.0);
    
    emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x800000));
    emitter.colourSpline_.AddPoint(0.3, new THREE.Color(0xFF0000));
    emitter.colourSpline_.AddPoint(0.4, new THREE.Color(0xdeec42));
    emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0xf4a776));
    
    emitter.sizeSpline_.AddPoint(0.0, 0.5);
    emitter.sizeSpline_.AddPoint(0.5, 3.0);
    emitter.sizeSpline_.AddPoint(1.0, 0.5);
    emitter.blend_ = 0.0;
    emitter.AddParticles(100);

    this.particles_.AddEmitter(emitter);

    emitter = new TinyExplosionEffectEmitter(p);
    emitter.alphaSpline_.AddPoint(0.0, 0.0);
    emitter.alphaSpline_.AddPoint(0.7, 1.0);
    emitter.alphaSpline_.AddPoint(1.0, 0.0);
    
    emitter.colourSpline_.AddPoint(0.0, new THREE.Color(0x000000));
    emitter.colourSpline_.AddPoint(1.0, new THREE.Color(0x000000));
    
    emitter.sizeSpline_.AddPoint(0.0, 0.5);
    emitter.sizeSpline_.AddPoint(0.5, 4.0);
    emitter.sizeSpline_.AddPoint(1.0, 4.0);
    emitter.blend_ = 1.0;
    emitter.delay_ = 0.25;
    emitter.AddParticles(50);

    this.particles_.AddEmitter(emitter);
  }

  Update(timeElapsed: number) {
    this.particles_.Update(timeElapsed);
    this.timer_ -= timeElapsed;
    if (this.timer_ <= 0) {
      this.Parent!.SetDead();
    }
  }
};
