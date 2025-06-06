import {THREE, OrbitControls} from '../utils/three-defs.ts';

import {Component} from "../engine/entity.ts";

export class ThreeJSController extends Component {
  threejs_: THREE.WebGLRenderer;
  camera_: THREE.PerspectiveCamera;
  scene_: THREE.Scene;
  listener_: THREE.AudioListener;
  crawlCamera_: THREE.PerspectiveCamera;
  crawlScene_: THREE.Scene;
  uiCamera_: THREE.OrthographicCamera;
  uiScene_: THREE.Scene;
  sun_: THREE.DirectionalLight;
  
  constructor() {
    super();
  }

  InitEntity() {
    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.threejs_.outputColorSpace = THREE.SRGBColorSpace;
    // this.threejs_.gammaFactor = 2.2;
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
    this.threejs_.domElement.id = 'threejs';
    // this.threejs_.physicallyCorrectLights = true;

    document.getElementById('container')!.appendChild(this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.OnResize_();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera_.position.set(20, 5, 15);
    this.scene_ = new THREE.Scene();

    let light = new THREE.DirectionalLight(0x8088b3, 10.0);
    light.position.set(-10, 500, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 1.0;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 500;
    light.shadow.camera.right = -500;
    light.shadow.camera.top = 500;
    light.shadow.camera.bottom = -500;
    this.scene_.add(light);

    this.sun_ = light;

    let ambLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    this.scene_.add(ambLight);

    this.LoadBackground_();
    // this.LoadPlanet_();
    this.OnResize_();
  }

  LoadBackground_() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './resources/terrain/space-posx.jpg',
        './resources/terrain/space-negx.jpg',
        './resources/terrain/space-posy.jpg',
        './resources/terrain/space-negy.jpg',
        './resources/terrain/space-posz.jpg',
        './resources/terrain/space-negz.jpg',
    ]);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.scene_.background = texture;
    
  }

  OnResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();

    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  Render() {
    this.threejs_.autoClearColor = true;
    this.threejs_.render(this.scene_, this.camera_);
  }

  Update(timeElapsed: number) {
    const player = this.FindEntity('player');
    if (!player) {
      console.warn('No player entity found for ThreeJSController');
      return;
    }
    const pos = player._position;

    this.sun_.position.copy(pos);
    this.sun_.position.add(new THREE.Vector3(-10, 500, 10));
    this.sun_.target.position.copy(pos);
    this.sun_.updateMatrixWorld();
    this.sun_.target.updateMatrixWorld();

  }
}
