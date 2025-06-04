import * as THREE from 'three';


export class Cube extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    super(geometry, material);

    this.castShadow = true;
    this.receiveShadow = true;

    // Set initial position
    this.position.set(0, 0, 0);
  }

  Update(timeElapsed: number) {
    this.rotation.x += 0.01 * timeElapsed;
    this.rotation.z += 0.01 * timeElapsed;
  }
}