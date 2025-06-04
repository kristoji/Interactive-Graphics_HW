export class BasicCharacterControllerInput {
  public keys: { forward: boolean; backward: boolean; left: boolean; right: boolean; space: boolean; shift: boolean; };
  
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };

    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event: KeyboardEvent) {
    let keyCode = event.code || event.key;
    switch (keyCode) {
      case 'KeyW':
        this.keys.forward = true;
        break;
      case 'KeyA':
        this.keys.left = true;
        break;
      case 'KeyS':
        this.keys.backward = true;
        break;
      case 'KeyD':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.space = true;
        break;
      case 'ShiftLeft':
        this.keys.shift = true;
        break;
    }
  }

  _onKeyUp(event: KeyboardEvent) {
    let keyCode = event.code || event.key;
    switch (keyCode) {
      case 'KeyW':
        this.keys.forward = false;
        break;
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'KeyS':
        this.keys.backward = false;
        break;
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.space = false;
        break;
      case 'ShiftLeft':
        this.keys.shift = false;
        break;
    }
  }
};