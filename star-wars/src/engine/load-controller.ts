import { GLTF } from 'three/examples/jsm/Addons.js';
import {THREE, FBXLoader, GLTFLoader, SkeletonUtils} from '../utils/three-defs.ts';

import {Component, Entity} from "./entity.ts";


interface ModelAsset {
  loader: FBXLoader | GLTFLoader;
  // asset: THREE.Object3D | null;
  asset: GLTF | THREE.Object3D | null;
  queue: Array<(asset: any) => void> | null;
}

interface TextureAsset {
  loader: THREE.TextureLoader;
  texture: THREE.Texture;
  colorSpace?: any;
}

export class LoadController extends Component {
  textures_: Record<string, TextureAsset> = {};
  models_: Record<string, ModelAsset> = {};
  playing_: Entity[] = [];


  constructor() {
    super();

  }

  LoadTexture(path: string, name: string) {
    if (!(name in this.textures_)) {
      const loader = new THREE.TextureLoader();
      loader.setPath(path);

      this.textures_[name] = {loader: loader, texture: loader.load(name)};
      this.textures_[name].colorSpace = THREE.SRGBColorSpace;
    }

    return this.textures_[name].texture;
  }


  Load(path: string, name: string, onLoad: (asset: THREE.Object3D) => void) {
    if (name.endsWith('glb') || name.endsWith('gltf')) {
      this.LoadGLB(path, name, onLoad);
    } else if (name.endsWith('fbx')) {
      this.LoadFBX(path, name, onLoad);
    } else {
      // Silently fail, because screw you future me.
    }
  }


  LoadFBX(path: string, name: string, onLoad: (asset: THREE.Object3D) => void) {
    if (!(name in this.models_)) {
      const loader = new FBXLoader();
      loader.setPath(path);

      this.models_[name] = {loader: loader, asset: null, queue: [onLoad]};
      this.models_[name].loader.load(name, (fbx) => {
        this.models_[name].asset = fbx;

        const queue = this.models_[name].queue!;
        this.models_[name].queue = null;
        for (let q of queue) {
          const clone = (this.models_[name].asset! as THREE.Object3D).clone();
          q(clone);
        }
      });
    } else if (this.models_[name].asset == null) {
      this.models_[name].queue!.push(onLoad);
    } else {
      const clone = (this.models_[name].asset as THREE.Object3D).clone();
      onLoad(clone);
    }
  }

  LoadGLB(path: string, name: string, onLoad: (scene: THREE.Group) => void) {
    const fullName = path + name;
    if (!(fullName in this.models_)) {
      const loader = new GLTFLoader();
      loader.setPath(path);

      this.models_[fullName] = {loader: loader, asset: null, queue: [onLoad]};
      this.models_[fullName].loader.load(name, (glb) => {
        this.models_[fullName].asset = glb;

        const queue = this.models_[fullName].queue!;
        this.models_[fullName].queue = null;
        for (let q of queue) {
          const clone = {...glb};
          clone.scene = SkeletonUtils.clone(clone.scene);

          q(clone.scene);
        }
      });
    } else if (this.models_[fullName].asset == null) {
      this.models_[fullName].queue!.push(onLoad);
    } else {
      const originalGLTF = this.models_[fullName].asset as GLTF;
      const clone: GLTF = {
        ...originalGLTF,
        scene: SkeletonUtils.clone(originalGLTF.scene) as THREE.Group,
      };
      
      onLoad(clone.scene);
    }
  }

  Update(timeElapsed: number) {
  }
}
