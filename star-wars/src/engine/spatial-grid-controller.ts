import {Component} from '../engine/entity.ts';
import { SpatialHashGrid } from './spatial-hash-grid.ts';
import type {couple, Client, Node} from '../utils/types.ts';



export class SpatialGridController extends Component {
  grid_: SpatialHashGrid;
  client_: Client | null = null;
  
  constructor(grid: SpatialHashGrid) {
    super();

    this.grid_ = grid;
  }

  Destroy() {
    this.grid_.Remove(this.client_!);
    this.client_ = null;
  }

  InitEntity() {
    this.RegisterHandler_('physics.loaded', () => this.OnPhysicsLoaded_());

    const pos: couple<number> = [
      this.Parent!.Position.x,
      this.Parent!.Position.z,
    ];

    this.client_ = this.grid_.NewClient(pos, [1, 1], this.parent_!);
  }

  OnPhysicsLoaded_() {
    this.RegisterHandler_('update.position', (m) => this.OnPosition_());
    this.OnPosition_();
  }

  OnPosition_() {
    const pos = this.Parent!.Position;
    this.client_!.position = [pos.x, pos.z];
    this.grid_.UpdateClient(this.client_!);
  }

  FindNearbyEntities(range: number): Array<Client> {
    const results = this.grid_.FindNear(
        [this.parent_!._position.x, this.parent_!._position.z], [range, range]);
        
    return results.filter(c => c.entity != this.parent_);
  }
};