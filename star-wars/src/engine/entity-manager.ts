import { Entity } from './entity.ts';

export class EntityManager {
    numUpdates_: number = 0;
    ids_: number = 0;
    entitiesMap_: { [key: string]: Entity } = {};
    entities_: Entity[] = [];

    _GenerateName() : string {
        return `__name__${this.ids_}`;
    }

    Get(name: string) {
        return this.entitiesMap_[name];
    }

    Filter(cb: (entity: Entity) => boolean): Entity[] {
        return this.entities_.filter(cb);
    }

    Add(entity: Entity, name: string | null = null) {  
        if (name === null) 
            name = this._GenerateName();
        
        this.entitiesMap_[name] = entity;
        this.entities_.push(entity);
        
        entity.SetParent(this);
        entity.SetName(name);
        entity.SetId(this.ids_);
        entity.InitEntity();
        this.ids_ += 1;
    }

    SetActive(entity: Entity, activate: boolean) {
        const i = this.entities_.indexOf(entity);

        if (!activate) {
            if (i < 0)
                return;
            this.entities_.splice(i, 1);
        }
        else {
            if (i >= 0)
                return;
            this.entities_.push(entity);
        }
    }

    Update(timeElapsed: number, pass: number) {
        this.numUpdates_ ++;


        const dead: Entity[] = [];
        const alive: Entity[] = [];

        for (let i = 0; i < this.entities_.length; ++i) {
            const e = this.entities_[i];

            e.Update(timeElapsed, pass);

            if (e.IsDead) {
                dead.push(e);
            }
            else {
                alive.push(e);
            }
        }


        for (let i = 0; i < dead.length; ++i) {
            const e = dead[i];
            delete this.entitiesMap_[e.Name!];
            e.Destroy();
        }
        this.entities_ = alive;
    }

}
