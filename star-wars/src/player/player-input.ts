import {Component} from "../engine/entity.ts";

import type {Input} from '../utils/types.ts';


export class PlayerInput extends Component {
  name = 'PlayerInput';
  constructor() {
    super();
  }

  InitEntity() {
    this.Parent!.Attributes!.InputCurrent = {
      axis1Forward: 0.0,
      axis1Side: 0.0,
      axis2Forward: 0.0,
      axis2Side: 0.0,
      pageUp: false,
      pageDown: false,
      space: false,
      shift: false,
      backspace: false,
    };
    this.Parent!.Attributes!.InputPrevious = {
      ...this.Parent!.Attributes!.InputCurrent};
    console.log('PlayerInput initialized');
    document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
    document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
  }

  OnKeyDown_(event: KeyboardEvent) {
    // if (event.currentTarget!.activeElement != document.body) {
    //   return;
    // }
    
    const currInput = this.Parent!.Attributes!.InputCurrent!;
    const keyCode = event.code || event.key;
    switch (keyCode) {
      case 'KeyW':
        currInput.axis1Forward = -1.0;
        break;
      case 'KeyA': // a
        currInput.axis1Side = -1.0;
        break;
      case 'KeyS': // s
        currInput.axis1Forward = 1.0;
        break;
      case 'KeyD': // d
        currInput.axis1Side = 1.0;
        break;
      case 'PageUp': // PG_UP
        currInput.pageUp = true;
        break;
      case 'PageDown': // PG_DOWN
        currInput.pageDown = true;
        break;
      case 'Space': // SPACE
        currInput.space = true;
        break;
      case 'ShiftLeft': // SHIFT
        currInput.shift = true;
        break;
      case 'Backspace': // BACKSPACE
        currInput.backspace = true;
        break;
      case 'ArrowLeft': // LEFT
        currInput.axis2Side = -1.0;
        break;
      case 'ArrowRight': // RIGHT
        currInput.axis2Side = 1.0;
    }
  }

  OnKeyUp_(event: KeyboardEvent) {
    // if (event.currentTarget.activeElement != document.body) {
    //   return;
    // }
    const currInput = this.Parent!.Attributes!.InputCurrent!;
    const keyCode = event.code || event.key;
    switch(keyCode) {
      case 'KeyW': // w
        currInput.axis1Forward = 0.0;
        break;
      case 'KeyA': // a
        currInput.axis1Side = 0.0;
        break;
      case 'KeyS': // s
        currInput.axis1Forward = 0.0;
        break;
      case 'KeyD': // d
        currInput.axis1Side = 0.0;
        break;
      case 'PageUp': // PG_UP
        currInput.pageUp = false;
        break;
      case 'PageDown': // PG_DOWN
        currInput.pageDown = false;
        break;
      case 'Space': // SPACE
        currInput.space = false;
        break;
      case 'ShiftLeft': // SHIFT
        currInput.shift = false;
        break;
      case 'Backspace': // BACKSPACE
        currInput.backspace = false;
        break;
      case 'ArrowLeft': // LEFT
        currInput.axis2Side = 0.0;
        break;
      case 'ArrowRight': // RIGHT
        currInput.axis2Side = 0.0;
        break;
    }
  }

  Update(_) {
    this.Parent!.Attributes!.InputPrevious = {
        ...this.Parent!.Attributes!.InputCurrent!};
  }
};
