import {THREE} from '../utils/three-defs.ts';
import {Bullet} from '../utils/types.ts';
import {Component} from "../engine/entity.ts";

const _VS = `
out vec2 v_UV;
out vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  v_UV = uv;
}
`;

const _PS = `
uniform sampler2D diffuse;

in vec2 v_UV;
in vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0) * texture(diffuse, v_UV);
}
`;

export class BlasterSystem extends Component {
  params_: {
    scene: THREE.Scene;
    camera: THREE.Camera;
    texture: string;
  };
  material_: THREE.ShaderMaterial;
  geometry_: THREE.BufferGeometry;
  particleSystem_: THREE.Mesh;
  liveParticles_: Bullet[];

  constructor(params: {
                        scene: THREE.Scene;
                        camera: THREE.Camera;
                        texture: string;
                      }) {
    super();
    this.params_ = params;
    this.Init_();
  }

  Init_() {
    const uniforms = {
      diffuse: {
        value: new THREE.TextureLoader().load(this.params_.texture)
      }
    };
    this.material_ = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _PS,

      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    this.geometry_ = new THREE.BufferGeometry();

    this.particleSystem_ = new THREE.Mesh(this.geometry_, this.material_);
    this.particleSystem_.frustumCulled = false;

    this.liveParticles_ = [];

    this.params_.scene.add(this.particleSystem_);
  }

  // CreateParticle() {
  //   const p = {
  //     Start: new THREE.Vector3(0, 0, 0),
  //     End: new THREE.Vector3(0, 0, 0),
  //     Colour: new THREE.Color(),
  //     Size: 1,
  //     Alive: true,
  //   };
    
  //   return p;
  // }

  AddParticle(p: Bullet) {
    this.liveParticles_.push(p);
  }

  Update(timeInSeconds: number) {
    // const _R = new THREE.Ray();
    // const _M = new THREE.Vector3();
    // const _S = new THREE.Sphere();
    // const _C = new THREE.Vector3();

    for (const p of this.liveParticles_) {
      p.Life -= timeInSeconds;
      if (p.Life <= 0) {
        p.Alive = false;
        continue;
      }

      p.End.add(p.Velocity.clone().multiplyScalar(timeInSeconds));

      const segment = p.End.clone().sub(p.Start);
      if (segment.length() > p.Length) {
        const dir = p.Velocity.clone().normalize();
        p.Start = p.End.clone().sub(dir.multiplyScalar(p.Length));
      }

      // instead of raycasting here, we exploit the lib in xwing controller
      // // Find intersections
      // _R.direction.copy(p.Velocity);
      // _R.direction.normalize();
      // _R.origin.copy(p.Start);

      // const blasterLength = p.End.distanceTo(p.Start);
      // _M.addVectors(p.Start, p.End);
      // _M.multiplyScalar(0.5);

      // const potentialList = this._params.visibility.GetLocalEntities(_M, blasterLength * 0.5);

      // // Technically we should sort by distance, but I'll just use the first hit. Good enough.
      // if (potentialList.length == 0) {
      //   continue;
      // }

      // for (let candidate of potentialList) {
      //   _S.center.copy(candidate.Position);
      //   _S.radius = 2.0;

      //   if (!_R.intersectSphere(_S, _C)) {
      //     continue;
      //   }

      //   if (_C.distanceTo(p.Start) > blasterLength) {
      //     continue;
      //   }

      //   p.Alive = false;
      //   candidate.TakeDamage(100.0);
      //   break;
      // }
    }

    this.liveParticles_ = this.liveParticles_.filter(p => {
      return p.Alive;
    });

    this.GenerateBuffers_();
  }

  GenerateBuffers_() {
    const indices: number[] = [];
    const positions: number[] = [];
    const colors: number[] = [];
    const uvs: number[] = [];

    // from a rectangle to 2 triangles
    const square = [0, 1, 2, 2, 3, 0];
    let indexBase = 0;

    const worldToView = this.params_.camera.matrixWorldInverse;
    const viewToWorld = this.params_.camera.matrixWorld;

    // get the rectangle vertices for each particle
    for (const p of this.liveParticles_) {
      indices.push(...square.map(i => i + indexBase));
      indexBase += 4;

      const startToCamera = this.params_.camera.position.clone().sub(p.Start);
      startToCamera.normalize();
      const startToEnd = p.End.clone().sub(p.Start);
      startToEnd.normalize();

      // cross product to get perpendicular vector to both
      const upWS = startToEnd.clone().cross(startToCamera);
      upWS.multiplyScalar(p.Width);

      const p1 = new THREE.Vector3().copy(p.Start);
      p1.add(upWS);

      const p2 = new THREE.Vector3().copy(p.Start);
      p2.sub(upWS);

      const p3 = new THREE.Vector3().copy(p.End);
      p3.sub(upWS);

      const p4 = new THREE.Vector3().copy(p.End);
      p4.add(upWS);

      positions.push(p1.x, p1.y, p1.z);
      positions.push(p2.x, p2.y, p2.z);
      positions.push(p3.x, p3.y, p3.z);
      positions.push(p4.x, p4.y, p4.z);

      // U-V normalized axes coordinates
      uvs.push(0.0, 0.0);
      uvs.push(1.0, 0.0);
      uvs.push(1.0, 1.0);
      uvs.push(0.0, 1.0);

      const c = p.Colours[0].lerp(
          p.Colours[1], 1.0 - p.Life / p.TotalLife);
      for (let i = 0; i < 4; i++) {
        colors.push(c.r, c.g, c.b);
      }
    }

    this.geometry_.setAttribute(
        'position', new THREE.Float32BufferAttribute(positions, 3));
    this.geometry_.setAttribute(
        'uv', new THREE.Float32BufferAttribute(uvs, 2));
    this.geometry_.setAttribute(
        'color', new THREE.Float32BufferAttribute(colors, 3));
    this.geometry_.setIndex(
        new THREE.BufferAttribute(new Uint32Array(indices), 1));

    this.geometry_.attributes.position.needsUpdate = true;
    this.geometry_.attributes.uv.needsUpdate = true;
  }
};
