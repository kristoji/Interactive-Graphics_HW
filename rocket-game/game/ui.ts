import { AnimationClip, AnimationMixer, Camera, Clock, InterpolateLinear, InterpolateSmooth, LoopOnce, Object3D, Quaternion, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from "three";
import { camera, scene, sceneConfiguration, sceneSetup } from "../main";
import { mothershipModel, rocketModel } from "./objects";

export const countUIclass = document.getElementById('headsUpDisplay')!;
export const crystalUiElement = document.getElementById('crystalCount')!;
export const startButton = document.getElementById('startGame')!;
export const startPanel = document.getElementById('levelStartPanel')!;

const startOverButton = document.getElementById('startOver')!;
const endOfLevel = document.getElementById('endOfLevel')!;
const crystalCountLevelEnd = document.getElementById('crystalCountLevelEnd')!;

export const uiInit = () => {
    
    startButton.onclick = (event) => {
        
        hideLevelEndScreen();

        countUIclass.classList.remove('hidden');
        startPanel.classList.add('hidden');
        startLevelAnimation();

        crystalUiElement.innerText = String(sceneConfiguration.data.crystalsCollected);
    }
}

export const startLevelAnimation = () => {
    sceneConfiguration.cameraStartAnimationPlaying = true;

    camera.userData.mixer = new AnimationMixer(camera);

    // Define keyframe times
    const times = [0, 0.7, 1.4];

    // Position: start → overshoot → settle
    const positionValues = [
        camera.position.x, camera.position.y, camera.position.z,    // Start
        0, 35, 110,                                                  // Overshoot
        0, 30, 100                                                   // Final
    ];
    const positionTrack = new VectorKeyframeTrack('.position', times, positionValues, InterpolateSmooth);

    // Rotation: start → overshoot → settle
    const startQuat = camera.quaternion.clone();
    const overshootQuat = new Quaternion();
    if (camera.position.x > 0)
        overshootQuat.setFromAxisAngle(new Vector3(0, 0, 1), 0.3); // Overshoot
    else
        overshootQuat.setFromAxisAngle(new Vector3(0, 0, 1), -0.3); // Overshoot

        
    const endQuat = new Quaternion().setFromAxisAngle(new Vector3(-1, 0, 0), 0.3);        // Final

    const rotationValues = [
        startQuat.x, startQuat.y, startQuat.z, startQuat.w,
        overshootQuat.x, overshootQuat.y, overshootQuat.z, overshootQuat.w,
        endQuat.x, endQuat.y, endQuat.z, endQuat.w,
    ];
    const rotationTrack = new QuaternionKeyframeTrack('.quaternion', times, rotationValues, InterpolateLinear);

    const animationClip = new AnimationClip('animateIn', 2, [positionTrack, rotationTrack]);
    const animationAction = camera.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(LoopOnce, 1);
    animationAction.clampWhenFinished = true;

    camera.userData.clock = new Clock();
    camera.userData.mixer.addEventListener('finished', () => {
        // camera.lookAt(new Vector3(0, -500, -1400));
        sceneConfiguration.speed = 1;
        sceneConfiguration.rocketMoving = true;
    });

    animationAction.play();
}

export const animateCameraFromEndToStartPosition = () => {
    sceneConfiguration.cameraStartAnimationPlaying = true;

    const endPosition = new Vector3(20, 30, 0);

    camera.userData.mixer = new AnimationMixer(camera);

    const times = [0, 1.2, 2];

    // Position animation
    const positionValues = [
        camera.position.x, camera.position.y, camera.position.z,
        0, 50, -100,
        endPosition.x, endPosition.y, endPosition.z
    ];
    const positionTrack = new VectorKeyframeTrack('.position', times, positionValues, InterpolateSmooth);


    // Compute rotation to look at the rocket
    let lookAtTarget = mothershipModel.position.clone();
    let overshootQuat = new Quaternion();
    let camDummy = new Camera(); // Use dummy to get consistent rotation

    camDummy.position.copy(endPosition);
    camDummy.lookAt(lookAtTarget);
    overshootQuat.copy(camDummy.quaternion);

    // Compute rotation to look at the rocket
    lookAtTarget = rocketModel.position.clone();
    const endQuat = new Quaternion();

    camDummy.position.copy(endPosition);
    camDummy.lookAt(lookAtTarget);
    endQuat.copy(camDummy.quaternion);

    const startQuat = camera.quaternion.clone();

    const rotationValues = [
        startQuat.x, startQuat.y, startQuat.z, startQuat.w,
        overshootQuat.x, overshootQuat.y, overshootQuat.z, overshootQuat.w,
        endQuat.x, endQuat.y, endQuat.z, endQuat.w
    ];
    const rotationTrack = new QuaternionKeyframeTrack('.quaternion', times, rotationValues, InterpolateLinear);

    const animationClip = new AnimationClip('animateIn', 2, [positionTrack, rotationTrack]);
    const animationAction = camera.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(LoopOnce, 1);
    animationAction.clampWhenFinished = true;

    camera.userData.clock = new Clock();
    camera.userData.mixer.addEventListener('finished', () => {
        sceneConfiguration.cameraStartAnimationPlaying = false;

    });

    animationAction.play();
};


export const showLevelEndScreen = () => {
    countUIclass.classList.add('hidden');
    endOfLevel.style!.display = 'flex';
    endOfLevel.classList.add('fadeOut');
    crystalCountLevelEnd.innerText = `Crystals collected: ${sceneConfiguration.data.crystalsCollected}`;
    startOverButton.classList.remove('hidden');
    
    startOverButton.onclick = () => {
        if (sceneConfiguration.levelOver && !sceneConfiguration.rocketMoving) {

            hideLevelEndScreen();
            startPanel.classList.remove('hidden');
            // startButton.classList.remove('hidden');
            // restart();
            sceneSetup(true);
        }
    }
}

export const hideLevelEndScreen = () => {
    endOfLevel.style!.display = '';
    endOfLevel.classList.remove('fadeOut');
    endOfLevel.classList.add('hidden');
    startOverButton.classList.add('hidden');

    sceneConfiguration.cameraStartAnimationPlaying = false;
    sceneConfiguration.rocketMoving = false;

}

const restart = () => {

}