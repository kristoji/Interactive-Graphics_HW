import * as THREE from 'three';
import { BasicCharacterController } from './objects/SpaceShips';
import { ThirdPersonCamera } from './components/Camera';
import { BasicInput, PlayerInput } from './components/Controller';
import { NPCController } from './objects/Npc';


export class Demo {
  private _threejs: THREE.WebGLRenderer;
  private _previousRAF: number | null;
  // private _mixers: never[];
  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _controls: BasicCharacterController;
  private _thirdPersonCamera: ThirdPersonCamera;
  private _NPC: NPCController;

  constructor() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    // this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.outputColorSpace = THREE.SRGBColorSpace;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  
    document.body.appendChild(this._threejs.domElement);
  
    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);
  
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 25);
  
    this._scene = new THREE.Scene();
  
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(-100, 100, 100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 50;
    light.shadow.camera.right = -50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    this._scene.add(light);
  
    const ambLight = new THREE.AmbientLight(0xFFFFFF, 5);
    this._scene.add(ambLight);
  
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '../images/bg/px_eso0932a.jpg',
        '../images/bg/nx_eso0932a.jpg',
        '../images/bg/py_eso0932a.jpg',
        '../images/bg/ny_eso0932a.jpg',
        '../images/bg/pz_eso0932a.jpg',
        '../images/bg/nz_eso0932a.jpg',
    ]);
    texture.mapping = THREE.CubeReflectionMapping; // set the mapping type for the texture
    texture.colorSpace = THREE.SRGBColorSpace; // set the color space to sRGB for proper color rendering
    this._scene.background = texture;
  
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x808080,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);
  
    // this._mixers = [];
    this._previousRAF = null;
  

    this._controls = new BasicCharacterController({
      modelName: 'Bob',
      color: 'Purple',
      position: new THREE.Vector3(0, 5, 0),
      scene: this._scene,
    });

    this._NPC = new NPCController({
      modelName: 'Pancake',
      color: 'Red',
      position: new THREE.Vector3(0, 5, -10),
      scene: this._scene,
    })

    this._thirdPersonCamera = new ThirdPersonCamera({
      camera: this._camera,
      target: this._controls,
    });

    const gridHelper = new THREE.GridHelper(100, 10);
    this._scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(5);
    this._scene.add(axesHelper);





    this._RAF();
  }


  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed: number) {
    const timeElapsedS = timeElapsed * 0.001;
    // if (this._mixers) {
    //   this._mixers.map(m => m.update(timeElapsedS));
    // }

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }

    this._thirdPersonCamera.Update(timeElapsedS);
  }
}


