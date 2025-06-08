import {THREE} from './three-defs.ts';


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