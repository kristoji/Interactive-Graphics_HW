import {THREE} from '../utils/three-defs.js';

import {Entity, Component} from './entity.ts';
import { PlayerController } from '../player/player-controller.ts';
import { PlayerInput } from '../player/player-input.ts';
import { RenderComponent } from './render-component.ts';
import { ThirdPersonCamera } from '../player/third-person-camera.ts';
import { TieFighterController } from '../controllers/tie-fighter-controller.ts';
import { XWingController } from '../controllers/xwing-controller.ts';
import { XWingEffects } from '../effects/xwing-effects.ts';
import { ShipEffects } from '../effects/ship-effect.ts';
import { EnemyAIController } from '../controllers/enemy-ai-controller.ts';
import { SpatialGridController } from './spatial-grid-controller.ts';
import { SpatialHashGrid } from './spatial-hash-grid.ts';
import { ExplodeEffect, TinyExplodeEffect } from '../effects/explode-component.ts';
import { HealthController } from '../controllers/health-controller.ts';
import { ShieldsController } from '../controllers/shields-controller.ts';


export class PlayerSpawner extends Component {
  params_: {
    camera: THREE.Camera;
    scene: THREE.Scene;
    grid: SpatialHashGrid;
  }
  constructor(params: {
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
      offset: new THREE.Vector3(0, -5, -4),
      blasterStrength: 10,
    };

    const player = new Entity();
    player.Attributes!.team = 'allies';
    player.SetPosition(new THREE.Vector3(0, 600, -800));
    player.SetQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI))
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
    player.AddComponent(new PlayerController());
    player.AddComponent(new SpatialGridController(this.params_.grid));
    player.AddComponent(new ShieldsController());
    player.AddComponent(new HealthController({
                                                maxHealth: 50,
                                                shields: 50,
                                              }));
    player.AddComponent(new ThirdPersonCamera({
                                                camera: this.params_.camera,
                                                target: player
                                              }));
    player.Attributes!.roughRadius = 10;
    this.Manager!.Add(player, 'player');

    player.Broadcast({topic:'physics.loaded'});

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
    e.AddComponent(new HealthController({maxHealth: 50,}));
    e.AddComponent(new EnemyAIController())


    e.Attributes!.roughRadius = 10;
    this.Manager!.Add(e);
    e.Broadcast({topic:'physics.loaded'});

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
    e.AddComponent(new HealthController({
      maxHealth: 50,
      shields: 50,
    }));
    e.AddComponent(new EnemyAIController())
    e.AddComponent(new ShieldsController());

    e.Attributes!.roughRadius = 10;
    
    
    this.Manager!.Add(e);
    
    e.Broadcast({topic:'physics.loaded'});

    return e;
  }
};


export class ShipSmokeSpawner extends Component {
  params_ : {
    camera: THREE.Camera,
    scene: THREE.Scene,
  }

  constructor(params: {
                        camera: THREE.Camera,
                        scene: THREE.Scene,
                      }
                      ) {
    super();
    this.params_ = params;
  }

  Spawn(target: Entity) {
    const params = {
      camera: this.params_.camera,
      scene: this.params_.scene,
      target: target,
    };

    const e = new Entity();
    e.SetPosition(target.Position);
    e.AddComponent(new ShipEffects(params));

    this.Manager!.Add(e);

    return e;
  }
};

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
