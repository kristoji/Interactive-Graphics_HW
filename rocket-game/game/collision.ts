import { AnimationClip, AnimationMixer, Box3, BoxGeometry, Clock, InterpolateSmooth, LoopOnce, Material, Mesh, MeshBasicMaterial, Object3D, Quaternion, QuaternionKeyframeTrack, SphereGeometry, Vector3, VectorKeyframeTrack } from "three";
import { camera, scene, sceneConfiguration } from "../main";
import { challengeRows, ObjectType, rocketModel, shieldModel, shieldModel_transparent } from "./objects";
import { radToDeg } from "three/src/math/MathUtils";
import { crystalUiElement, showLevelEndScreen } from "./ui";

export const destructionBits = new Array<Mesh>();
export let destructionShield: Object3D | null = null;

export const detectCollisions = () => {

    if (sceneConfiguration.levelOver) return;

    const rocketBox = new Box3().setFromObject(rocketModel);

    challengeRows.forEach(row => {
        row.rowParent.updateMatrixWorld();

        row.rowParent.children.forEach(objType => {
            objType.children.forEach(item => {
                const itemBox = new Box3().setFromObject(item);
                if (itemBox.intersectsBox(rocketBox)) {
                    let destructionPosition = itemBox.getCenter(item.position);
                    objType.remove(item);
                    
                    let type = objType.userData.objectType as ObjectType;
                    if (type !== undefined) {
                        switch (type) {
                            case ObjectType.ROCK:
                                playDestructionAnimationRock(destructionPosition);
                                sceneConfiguration.data.shieldsCollected--;
                                // if (sceneConfiguration.data.shieldsCollected < 0)
                                //     endLevel(true);
                                break;
                            case ObjectType.SHIELD_ITEM:
                                sceneConfiguration.data.shieldsCollected++;
                                playDestructionAnimationShield(destructionPosition);
                                break;
                            case ObjectType.CRYSTAL:
                                crystalUiElement.innerText = String(++sceneConfiguration.data.crystalsCollected);
                                playDestructionAnimationCrystal(destructionPosition);
                                break;
                        }
                    }
                }
            });
        });
    });
}



const playDestructionAnimationCrystal = (position : any) => {
    
    for (let i = 0; i < 6;  i++) {
        let destructionParticle = new Mesh(new SphereGeometry(0.3), new MeshBasicMaterial({
            color: 'yellow',
            transparent: true,
            opacity: 0.5
        }));


        destructionParticle.userData.lifetime = 0;
        destructionParticle.position.copy(position);

        destructionParticle.userData.mixer = new AnimationMixer(destructionParticle);

        let degrees = i / 45;
        let overshootX = Math.cos(radToDeg(degrees)) * 15;
        let overshootY = Math.sin(radToDeg(degrees)) * 15;
        
        let track = new VectorKeyframeTrack('.position', [0,0.2],[
            position.x, position.y, position.z,
            position.x + overshootX, position.y+overshootY, position.z,
        ], InterpolateSmooth);

        const animationClip = new AnimationClip('animateIn', 10, [track]);
        const animationAction = destructionParticle.userData.mixer.clipAction(animationClip);
        animationAction.setLoop(LoopOnce, 1);
        animationAction.clampWhenFinished = true;
        animationAction.play();
        destructionParticle.userData.clock = new Clock();
        scene.add(destructionParticle);
        // destructionParticle.userData.mixer.addEventListener('finished', () => {
        //     scene.remove(destructionParticle);
        // });
        destructionBits.push(destructionParticle);
    }
}

const playDestructionAnimationShield = (position : any) => {
    if (destructionShield) {
        scene.remove(destructionShield);
        destructionShield = null;
    }
    destructionShield = shieldModel_transparent.clone();
    destructionShield.position.copy(rocketModel.position);

    destructionShield.scale.set(0.1, 0.1, 0.1);
    destructionShield.userData.lifetime = 0;
    // scale it up in animation
    destructionShield.userData.mixer = new AnimationMixer(destructionShield);
    let track = new VectorKeyframeTrack('.scale', [0, 0.2], [
        0.1, 0.1, 0.1,
        1, 1, 1
    ], InterpolateSmooth);
    const animationClip = new AnimationClip('animateIn', 2, [track]);
    const animationAction = destructionShield.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(LoopOnce, 1);
    animationAction.clampWhenFinished = true;
    animationAction.play();
    destructionShield.userData.clock = new Clock();
    scene.add(destructionShield);

}

const playDestructionAnimationRock = (position : any) => {

    if (destructionShield) {
        scene.remove(destructionShield);
        destructionShield = null;
    }
    else {
        // shake the camera + camera look at the rocket
        shakeCamera();
        rocketModel.rotation.x += 1;
        sceneConfiguration.levelOver = true;
        // sceneConfiguration.rocketMoving = false;
        rocketModel.userData.endAnimationLifetime = 0;
        rocketModel.userData.clock = new Clock();
        showLevelEndScreen();
    }
}

export const shakeCamera = (intensity = 5, duration = 200) => {
    const startTime = performance.now();
    const originalPosition = camera.position.clone();

    const animate = () => {
        const elapsed = performance.now() - startTime;

        if (elapsed < duration) {
            // Apply small random offsets to the camera position
            camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
            camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
            camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;

            camera.rotation.x += Math.random()/100;
            camera.rotation.y += Math.random()/100;
            camera.rotation.z += Math.random()/100;
            

            requestAnimationFrame(animate);
        }
    };

    animate();

    camera.userData.mixer = new AnimationMixer(camera);

    // Define keyframe times
    const times = [0, 0.7, 1.4];

    // Position: start → overshoot → settle
    const dieLeftSign = sceneConfiguration.dieLeft ? 1 : -1;
    const positionValues = [
        camera.position.x, camera.position.y, camera.position.z,    // Start
        30*dieLeftSign, 35, 110,                                                  // Overshoot
        10*dieLeftSign, 30, 100                                                   // Final
    ];
    const positionTrack = new VectorKeyframeTrack('.position', times, positionValues, InterpolateSmooth);

    const animationClip = new AnimationClip('animateIn', 1.5, [positionTrack]);
    const animationAction = camera.userData.mixer.clipAction(animationClip);
    animationAction.setLoop(LoopOnce, 1);
    animationAction.clampWhenFinished = true;

    camera.userData.clock = new Clock();
    camera.userData.mixer.addEventListener('finished', () => {
        // camera.lookAt(rocketModel.position);
        // camera.lookAt(new Vector3(0, -500, -1400));
    });

    animationAction.play();
};

export const updateDestructionBits = () => {
    for (let i = 0; i < destructionBits.length; i++) {
        let bit = destructionBits[i];
        // bit.userData.lifetime += bit.userData.clock.getDelta() * 1000;
        if (bit.userData.lifetime > 500) {
            scene.remove(bit);
            destructionBits.splice(destructionBits.indexOf(bit), 1);
        } else {
            let target = new Vector3();
            target.copy(rocketModel.position);
            target.sub(bit.position);
            target.normalize();
            let dist = 0.01 * bit.userData.lifetime;
            dist = Math.min(dist, 0.8);
            bit.translateOnAxis(target, dist);
            bit.userData.lifetime++;

        }
    }
    if (destructionShield) {
        // shield.userData.lifetime += shield.userData.clock.getDelta() * 1000;
        if (destructionShield.userData.lifetime > 500) {
            scene.remove(destructionShield);
            destructionShield = null;
        } else {
            destructionShield.rotateZ(0.01);
            destructionShield.position.x = rocketModel.position.x;
            destructionShield.userData.lifetime++;
        }

    }
    
    if (rocketModel.position.y < -10 && sceneConfiguration.speed > 0) {
        sceneConfiguration.speed -= 0.01;
    } else if (rocketModel.position.y < -10) {
        sceneConfiguration.rocketMoving = false;

        let a = rocketModel.userData.clock.getElapsedTime();
        sceneConfiguration.speed = 0;
        let sa = Math.sin(a);
        camera.position.z += 0.01*sa;
        camera.position.x += 0.01*sa;
        
    } else if (sceneConfiguration.levelOver) {
        let t = rocketModel.userData.clock.getElapsedTime();
        const y0 = 10;
        const v0 = 70;
        const g = -90;
        const y = y0 + v0 * t + 0.5 * g * t * t;
        rocketModel.position.y = y;
        rocketModel.rotation.z += 0.1;
        rocketModel.rotation.x -= 0.01;

        if (sceneConfiguration.dieLeft)
            rocketModel.position.x += 0.1
        else 
            rocketModel.position.x -= 0.1

        // camera.lookAt(rocketModel.position);
        rocketModel.userData.endAnimationLifetime ++;
    } 
}