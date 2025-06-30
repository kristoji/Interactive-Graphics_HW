import {THREE} from '../utils/three-defs.js';
import { EntityManager } from '../engine/entity-manager.js'; // Adjust the path as needed

import type {Message, t_Attributes} from '../utils/types.ts';


export class Entity {
    name_: null | string = null;
    id_: null | number = null;
    components_: null | { [key: string]: Component } = null;
    attributes_: null | t_Attributes = {} as t_Attributes;
    _position: THREE.Vector3 = new THREE.Vector3();
    _rotation: THREE.Quaternion = new THREE.Quaternion();
    parent_: null | EntityManager = null;
    handlers_: null | { [key: string]: Function[] } = {};
    dead_: boolean = false;

    Destroy() {
        for (let k in this.components_)
            this.components_[k].Destroy();
        this.components_ = null;
        this.parent_ = null;
        this.handlers_ = null;
    }

    RegisterHandler_(name: string, handler: Function) {
        if (!this.handlers_)
            this.handlers_ = {};

        if (!(name in this.handlers_)) 
            this.handlers_[name] = [];
        
        this.handlers_[name].push(handler);
    }

    SetParent(parent: EntityManager) {
        this.parent_ = parent;
    }

    SetName(name: string) {
        this.name_ = name;
    }

    SetId(id: number) {
        this.id_ = id;
    }

    get Name(): string | null {
        return this.name_;
    }

    get ID(): number | null {
        return this.id_;
    }

    get Manager(): EntityManager | null {
        return this.parent_;
    }

    get IsDead(): boolean {
        return this.dead_;
    }

    get Attributes(): t_Attributes | null {
        return this.attributes_;
    }

    SetActive(b: boolean) {
      this.parent_!.SetActive(this, b);
    }

    SetDead() {
        this.dead_ = true;
    }

    AddComponent(component: Component) {
        component.SetParent(this);
        if (this.components_ === null) {
            this.components_ = {};
        }
        this.components_[component.name] = component;

        // console.log(`Entity.AddComponent: ${this.Name} (${this.ID}) - ${component.constructor.name}`);

        component.InitComponent();
    }

    InitEntity() {
      for (let k in this.components_) {
        this.components_[k].InitEntity();
      }
    }

    GetComponent(name: string): Component {
        return this.components_![name]!;
    }

    FindEntity(name: string): Entity {
        return this.parent_!.Get(name)!;
    }

    Broadcast<T>(msg: Message<T>) {
        if (this.IsDead)
            return;

        if (!this.handlers_ || !(msg.topic in this.handlers_)) 
            return;
        
        for (let curHandler of this.handlers_[msg.topic]) {
            curHandler(msg);
        }
    }

    SetPosition(pos: THREE.Vector3) {
        this._position.copy(pos);
        this.Broadcast<THREE.Vector3>({
            topic: 'update.position',
            value: this._position
        });
    }

    SetQuaternion(rot: THREE.Quaternion) {
        this._rotation.copy(rot);
        this.Broadcast<THREE.Quaternion>({
            topic: 'update.rotation',
            value: this._rotation
        });
    }

    get Position(): THREE.Vector3 {
        return this._position;
    }
    get Quaternion(): THREE.Quaternion {
        return this._rotation;
    }
    get Forward(): THREE.Vector3 {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this._rotation);
        return forward;
    }
    get Up(): THREE.Vector3 {
        const up = new THREE.Vector3(0, 1, 0);
        up.applyQuaternion(this._rotation);
        return up;
    }

    Update(timeElapsed: number, pass: number) {
        for (let k in this.components_) {
            const component = this.components_[k];
            if (component.Pass == pass)
                component.Update(timeElapsed);
        }
    }
}

export class Component {
    name: string = "";
    parent_: Entity | null = null;
    pass_: number = 0;

    InitComponent() {}

    InitEntity() {}

    Destroy() {}

    GetComponent(name: string): Component | null {
        return this.parent_!.GetComponent(name) || null;
    }

    FindEntity(name: string): Entity | null {
        return this.parent_!.FindEntity(name) || null;
    }

    Broadcast<T>(msg: Message<T>) {
        this.parent_!.Broadcast(msg);
    }

    SetParent(parent: Entity) {
        this.parent_ = parent;
    }

    Update(_) {}

    RegisterHandler_(name: string, handler: Function) {
        this.parent_!.RegisterHandler_(name, handler);
    }

    SetPass(pass: number) {
        this.pass_ = pass;
    }

    get Manager() : EntityManager | null {
      return this.parent_!.Manager;
    }

    get Parent(): Entity | null {
        return this.parent_;
    }
    get Pass(): number {
        return this.pass_;
    }

}

