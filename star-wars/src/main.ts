import {EntityManager} from './engine/entity-manager.ts';
import {Entity} from './engine/entity.ts';

import {LoadController} from './engine/load-controller.ts';

import {ThreeJSController} from './engine/threejs-component.ts';

import {THREE} from './utils/three-defs.js';
import { PlayerSpawner, TieFighterSpawner, XWingSpawner } from './engine/spawners.ts';
import { TieFighterController } from './entities/tie-fighter-controller.ts';

import * as MATH from './utils/math.js';

class StarWarsGame {
  firstStep_: number = 0;
  entityManager_: EntityManager;
  previousRAF_: null | number;
  threejs_: ThreeJSController;
  camera_: THREE.PerspectiveCamera;
  scene_: THREE.Scene;

  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this.entityManager_ = new EntityManager();

    this.LoadControllers_();


    this.previousRAF_ = null;
    this.RAF_();
  }

  LoadControllers_() {
    const threejs = new Entity();
    threejs.AddComponent(new ThreeJSController());
    this.entityManager_.Add(threejs, 'threejs');

    // Hack
    this.threejs_ = threejs.GetComponent('ThreeJSController') as ThreeJSController;
    this.scene_ = this.threejs_.scene_;
    this.camera_ = this.threejs_.camera_;

    const l = new Entity();
    l.AddComponent(new LoadController());
    this.entityManager_.Add(l, 'loader');

    const basicParams = {
      // grid: this.grid_,
      camera: this.camera_,
      scene: this.scene_,
      manager: this.entityManager_,
    };
    const spawner = new Entity();
    spawner.AddComponent(new PlayerSpawner(basicParams));
    spawner.AddComponent(new TieFighterSpawner(basicParams));
    spawner.AddComponent(new XWingSpawner(basicParams));
    this.entityManager_.Add(spawner, 'spawners');
    
    (spawner.GetComponent('PlayerSpawner') as PlayerSpawner).Spawn();


    for (let i = 0; i < 35; ++i) {
      const e = (spawner.GetComponent('TieFighterSpawner') as TieFighterSpawner).Spawn();
      const n = new THREE.Vector3(
        MATH.rand_range(-1, 1),
        MATH.rand_range(-1, 1),
        MATH.rand_range(-1, 1),
      );
      n.normalize();
      n.multiplyScalar(300);
      // n.add(new THREE.Vector3(0, 0, 1000));
      e.SetPosition(n);
    }
    
    for (let i = 0; i < 6; ++i) {
      const e = (spawner.GetComponent('XWingSpawner') as XWingSpawner).Spawn();
      const n = new THREE.Vector3(
        MATH.rand_range(-1, 1),
        MATH.rand_range(-1, 1),
        MATH.rand_range(-1, 1),
      );
      n.normalize();
      n.multiplyScalar(300);
      // n.add(new THREE.Vector3(0, 0, 800));
      e.SetPosition(n);
    }

    // spawner.GetComponent('StarDestroyerSpawner').Spawn();
  }

  RAF_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      } else {
        this.Step_(t - this.previousRAF_);
        this.threejs_.Render();
        this.previousRAF_ = t;
      }

      setTimeout(() => {
        this.RAF_();
      }, 1);
    });
  }

  Step_(timeElapsed: number) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this.entityManager_.Update(timeElapsedS, 0);
    this.entityManager_.Update(timeElapsedS, 1);
  }
}



window.addEventListener('DOMContentLoaded', () => {
  const _Setup = () => {
    new StarWarsGame();
    document.body.removeEventListener('click', _Setup);
  };
  document.body.addEventListener('click', _Setup);
});
