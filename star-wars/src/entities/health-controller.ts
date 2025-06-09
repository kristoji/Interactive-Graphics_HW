import {THREE} from '../utils/three-defs.ts';
import {Component} from '../engine/entity.ts';

import type {t_Attributes, Message, Hit} from '../utils/types.ts';
import { ExplosionSpawner, TinyExplosionSpawner } from '../engine/spawners.ts';

export class HealthController extends Component {
  params_: {
    maxHealth: number;
    shields?: number;
    ignoreCollisions?: boolean;
  };
  constructor(params: {
                        maxHealth: number;
                        shields?: number;
                        ignoreCollisions?: boolean;
                      }) {
    super();
    this.params_ = params;
  }

  InitEntity() {
    this.Parent!.Attributes!.health = this.params_.maxHealth;
    this.Parent!.Attributes!.maxHealth = this.params_.maxHealth;
    this.Parent!.Attributes!.shields = 0;
    this.Parent!.Attributes!.maxShields = 0;

    if (this.params_.shields) {
      this.Parent!.Attributes!.shields = this.params_.shields;
      this.Parent!.Attributes!.maxShields = this.params_.shields;
    }
    this.Parent!.Attributes!.dead = false;
  }

  InitComponent() {
    this.RegisterHandler_('player.hit', (m) => { this.OnHit_(m); });
    this.RegisterHandler_('physics.collision', (m) => { this.OnCollision_(m); });
  }

  OnCollision_(_) {
    if (this.Parent!.Attributes!.dead) {
      return;
    }

    if (this.params_.ignoreCollisions) {
      return;
    }

    this.Die_();
  }

  OnHit_(msg: Message<Hit>) {
    if (this.Parent!.Attributes!.dead) {
      return;
    }

    // const spawner = this.FindEntity('spawners')!.GetComponent('ShipSmokeSpawner') as ShipSmokeSpawner;
    // spawner.Spawn(this.Parent!);

    this.TakeDamage_(msg.value!);
  }

  TakeDamage_(hit: Hit) {
    let dmg = hit.dmg;
    const pos = hit.pos;

    // if has shields, compute true damage
    if (this.Parent!.Attributes!.maxShields) {
      this.Parent!.Attributes!.shields! -= dmg;
      if (this.Parent!.Attributes!.shields! < 0) {
        dmg = Math.abs(this.Parent!.Attributes!.shields!);
        this.Parent!.Attributes!.shields = 0;
      } else {
        dmg = 0;
      }
    }

    if (dmg <= 0) {
      return;
    }

    this.Parent!.Attributes!.health! -= dmg;

    const explosion = this.FindEntity('spawners')!.GetComponent('TinyExplosionSpawner') as TinyExplosionSpawner;
    explosion.Spawn(pos);    

    // this.Broadcast({topic: 'health.damage'});

    if (this.Parent!.Attributes!.health! <= 0) {
      this.Die_();
    }
  }

  Die_() {
    this.Parent!.Attributes!.health = 0;
    this.Parent!.Attributes!.shields = 0;
    this.Parent!.Attributes!.dead = true;
    this.Broadcast({topic: 'health.dead'});
    this.Parent!.SetDead();
    const e = (this.FindEntity('spawners')!.GetComponent('ExplosionSpawner') as ExplosionSpawner).Spawn(this.Parent!.Position);
    e.Broadcast({topic: 'health.dead'});
  }

  Update(_) {
    // DEMO
    // if (Math.random() < 0.0005) {
    //   this.OnHit_({value: 0});
    // }
  }
};
