import { EntityManager } from './entity-manager.ts';
import {THREE} from '../utils/three-defs.js';

import {Entity, Component} from './entity.ts';
import { PlayerController } from '../player/player-controller.ts';
import { PlayerInput } from '../player/player-input.ts';
import { RenderComponent } from './render-component.ts';
import { ThirdPersonCamera } from '../player/third-person-camera.ts';
import { TieFighterController } from '../entities/tie-fighter-controller.ts';
import { XWingController } from '../entities/xwing-controller.ts';
import { BasicRigidBody } from '../physics/basic-rigid-body.ts';
import { XWingEffects } from '../effects/xwing-effects.ts';
import { EnemyAIController } from '../entities/enemy-ai-controller.ts';
import { SpatialGridController } from './spatial-grid-controller.ts';
import { SpatialHashGrid } from './spatial-hash-grid.ts';
import { ExplodeEffect, TinyExplodeEffect } from '../effects/explode-component.ts';
import { Vector3 } from 'three';
import { HealthController } from '../entities/health-controller.ts';
import { ShieldsController } from '../entities/shields-controller.ts';


export class PlayerSpawner extends Component {
  params_: {
    camera: THREE.Camera;
    scene: THREE.Scene;
  }
  constructor(params: {
                        camera: THREE.Camera;
                        scene: THREE.Scene;
                      }) {
    super();
    this.params_ = params;
  }

  Spawn() {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
      offset: new THREE.Vector3(0, -5, -4),
      blasterStrength: 10,
    };

    const player = new Entity();
    player.Attributes!.team = 'allies';
    player.SetPosition(new THREE.Vector3(0, 600, -800));
    player.SetQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI))
    // player.AddComponent(
    //   new spatial_grid_controller.SpatialGridController(
    //       {grid: this.params_.grid}));
    player.AddComponent(new RenderComponent({
      scene: params.scene,
      resourcePath: './resources/models/x-wing/',
      resourceName: 'scene.gltf',
      scale: 2,
      offset: {
        position: new THREE.Vector3(0, -5, -4),
        quaternion: new THREE.Quaternion(),
      },
    }));
    player.AddComponent(new XWingController(params));
    player.AddComponent(new XWingEffects(params));
    player.AddComponent(new PlayerInput());
    // player.AddComponent(new player_ps4_input.PlayerPS4Input());
    player.AddComponent(new PlayerController());
    player.AddComponent(new BasicRigidBody({
      box: new THREE.Vector3(18, 6, 8),
    }));
    player.AddComponent(new HealthController({
      maxHealth: 50,
      shields: 50,
    }));
    // player.AddComponent(new crosshair.Crosshair());
    player.AddComponent(
      new ThirdPersonCamera({
          camera: this.params_.camera,
          target: player}));
    player.AddComponent(
        new ShieldsController());
    // player.AddComponent(
    //     new shields_ui_controller.ShieldsUIController(params));
    // player.AddComponent(
    //     new atmosphere_effect.AtmosphereEffect(params));

    // this.params_.manager.Add(player, 'player');
    this.Manager!.Add(player, 'player');


    return player;
  }
};

export class TieFighterSpawner extends Component {
  params_: {
    camera: THREE.Camera;
    scene: THREE.Scene;
    grid: SpatialHashGrid;
  };

  constructor(params : {
                          camera: THREE.Camera;
                          scene: THREE.Scene;
                          grid: SpatialHashGrid;
                        }) {
    super();
    this.params_ = params;
  }

  Spawn() {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
      blasterStrength: 20,
    };

    const e = new Entity();
    e.AddComponent(new SpatialGridController(this.params_.grid));
    e.AddComponent(new RenderComponent({
      scene: params.scene,
      resourcePath: './resources/models/tie-fighter-gltf/',
      resourceName: 'scene.gltf',
      scale: 0.15,
      colour: new THREE.Color(0xFFFFFF),
    }));
    e.AddComponent(new TieFighterController(params));
    e.AddComponent(new BasicRigidBody({
      box: new THREE.Vector3(15, 15, 15)
    }));
    e.AddComponent(new HealthController({
      maxHealth: 50,
    }));
    // // DEMO
    // e.AddComponent(new floating_descriptor.FloatingDescriptor());
    e.AddComponent(new EnemyAIController())

    // e.AddComponent(new enemy_ai_controller.EnemyAIController({
    //   grid: this.params_.grid,
    // }));

    this.Manager!.Add(e);

    return e;
  }
};

export class XWingSpawner extends Component {
  params_: {
    camera: THREE.Camera;
    scene: THREE.Scene;
    grid: SpatialHashGrid;
  };
  constructor(params : {
                          camera: THREE.Camera;
                          scene: THREE.Scene;
                          grid: SpatialHashGrid;
                        }) {  
    super();
    this.params_ = params;
  }

  Spawn() {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
      blasterStrength: 10,
      offset: new THREE.Vector3(0, -5, -4),
    };

    const e = new Entity();
    e.AddComponent(new SpatialGridController(this.params_.grid));
    e.AddComponent(new RenderComponent({
      scene: params.scene,
      resourcePath: './resources/models/x-wing/',
      resourceName: 'scene.gltf',
      scale: 2,
      offset: {
        position: new THREE.Vector3(0, -5, -4),
        quaternion: new THREE.Quaternion(),
      },
    }));
    e.AddComponent(new XWingEffects(params));
    e.AddComponent(new XWingController(params));
    e.AddComponent(new BasicRigidBody({
      box: new THREE.Vector3(15, 15, 15)
    }));
    e.AddComponent(new HealthController({
      maxHealth: 50,
      shields: 50,
    }));
    // // e.AddComponent(new floating_descriptor.FloatingDescriptor());
    e.AddComponent(new EnemyAIController())
    // {
    //   grid: this.params_.grid,
    // }));
    e.AddComponent(new ShieldsController());

    this.Manager!.Add(e);

    return e;
  }
};


// export class ShipSmokeSpawner extends Component {
//   params_ : {
//     camera: THREE.Camera,
//     scene: THREE.Scene,
//   }

//   constructor(params: {
//                         camera: THREE.Camera,
//                         scene: THREE.Scene,
//                       }
//                       ) {
//     super();
//     this.params_ = params;
//   }

//   Spawn(target: Entity) {
//     const params = {
//       camera: this.params_.camera,
//       scene: this.params_.scene,
//       target: target,
//     };

//     const e = new Entity();
//     e.SetPosition(target.Position);
//     e.AddComponent(new ShipEffects(params));

//     this.Manager.Add(e);

//     return e;
//   }
// };

export class ExplosionSpawner extends Component {
  params_ : {
    camera: THREE.Camera,
    scene: THREE.Scene,
  }

  constructor(params: {
                        camera: THREE.Camera,
                        scene: THREE.Scene,
                      }) {
    super();
    this.params_ = params;
  }

  Spawn(pos: THREE.Vector3) {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
    };

    const e = new Entity();
    e.SetPosition(pos);
    e.AddComponent(new ExplodeEffect(params));

    this.Manager!.Add(e);

    return e;
  }
};

export class TinyExplosionSpawner extends Component {
  params_ : {
    camera: THREE.Camera,
    scene: THREE.Scene,
  }

  constructor(params: {
                        camera: THREE.Camera,
                        scene: THREE.Scene,
                      }) {
    super();
    this.params_ = params;
  }

  Spawn(pos: THREE.Vector3) {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
    };

    const e = new Entity();
    e.SetPosition(pos);
    e.AddComponent(new TinyExplodeEffect(params));


    this.Manager!.Add(e);

    return e;
  }
};
