import { Entity } from '../engine/entity.ts';
import {THREE} from './three-defs.ts';


export type Hit = {
  dmg: number;
  pos: THREE.Vector3;
}

export type Input = {
  axis1Forward: number;
  axis1Side: number;
  axis2Forward: number;
  axis2Side: number;
  pageUp: boolean;
  pageDown: boolean;
  space: boolean;
  shift: boolean;
  backspace: boolean;
}

export type Message<T> = {
    topic: string;
    value?: T;
}

export type t_Attributes = {
    InputCurrent?: Input,
    InputPrevious?: Input,
    team?: string,
    roughRadius?: number,
    health?: number,
    maxHealth?: number,
    shields?: number,
    maxShields?: number,
    dead?: boolean
}

export type LerpFunction<T> = (t: number, a: T, b: T) => T;

export type Particle = {
  position: THREE.Vector3;
  size: number;
  colour: THREE.Color;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  velocity: THREE.Vector3;
  blend: number;
  drag: number;
  currentSize?: number;
};

export type Bullet = {
  Start: THREE.Vector3;
  End: THREE.Vector3;
  Velocity: THREE.Vector3;
  Length: number;
  Width: number;
  Life: number;
  Size: number;
  TotalLife: number;
  Alive: boolean;
  Colours: THREE.Color[];
}


export type couple<T> = [T, T];

export type Client = {
  position: couple<number>;
  dimensions: couple<number>;
  _cells: {
    min: couple<number> | null;
    max: couple<number> | null;
    nodes: Array<Array<Node>> | null;
  };
  _queryId: number;
  id_: number;
  entity: Entity;
}

export type Node = {
  next: Node | null;
  prev: Node | null;
  client: Client;
}
