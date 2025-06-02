import { sceneConfiguration } from "../main";

export const sensibility = 0.8;

export function onKeyDown(event: KeyboardEvent) {
    let keyCode = event.code || event.key;
    if (keyCode === 'ArrowLeft' || keyCode === 'KeyA') {
        sceneConfiguration.leftPressed = true;
    }
    else if (keyCode === 'ArrowRight' || keyCode === 'KeyD') {
        sceneConfiguration.rightPressed = true;
    }
}

export function onKeyUp(event: KeyboardEvent) {
    let keyCode = event.code || event.key;
    if (keyCode === 'ArrowLeft' || keyCode === 'KeyA') {
        sceneConfiguration.leftPressed = false;
    }
    else if (keyCode === 'ArrowRight' || keyCode === 'KeyD') {
        sceneConfiguration.rightPressed = false;
    }
}



export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
