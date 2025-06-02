import { Scene, PerspectiveCamera, WebGLRenderer, PlaneGeometry, TextureLoader, Vector3, MirroredRepeatWrapping, PMREMGenerator, MathUtils, ShaderMaterial, Mesh } from 'three';
// import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { rocketModel, mothershipModel, starterBay, challengeRows, environmentRocks, addChallengeRow, addBackgroundRock, objectsInit, objectsMotionUpdate , updateWaterMaterial} from './game/objects';
import { animateCameraFromEndToStartPosition, crystalUiElement, startPanel, uiInit } from './game/ui';
import { onKeyDown, onKeyUp, clamp, sensibility } from './game/control';
import { destructionBits, destructionShield, detectCollisions, updateDestructionBits } from './game/collision';
import { Water } from './env_obj/water';

export const scene = new Scene();
export const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

const sun = new Vector3();

// Our three renderer
let renderer: WebGLRenderer;

// Stores the current position of the camera, while the opening camera animation is playing
let cameraAngleStartAnimation = 0.00;


export const waterGeometry = new PlaneGeometry(10000, 10000);
export const water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new TextureLoader().load('static/normals/waternormals.jpeg', function (texture) {
            texture.wrapS = texture.wrapT = MirroredRepeatWrapping;
        }),
        sunDirection: new Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    }
);



export const sceneConfiguration = {
    /// Whether the scene is ready (i.e.: All models have been loaded and can be used)
    ready: false,
    /// Whether the camera is moving from the beginning circular pattern to behind the ship
    cameraMovingToStartPosition: false,
    /// Whether the rocket is moving forward
    rocketMoving: false,
    // backgroundMoving: false,
    /// Collected game data
    data: {
        /// How many crystals the player has collected on this run
        crystalsCollected: 0,
        /// How many shields the player has collected on this run (can be as low as -5 if player hits rocks)
        shieldsCollected: 0,
    },
    /// How far the player is through the current level, initialises to zero.
    courseProgress: 0,
    /// Whether the level has finished
    levelOver: false,
    /// The current level, initialises to one.
    level: 1,
    /// Whether the start animation is playing (the circular camera movement while looking at the ship)
    cameraStartAnimationPlaying: false,
    /// How many 'background Rocks' are in the scene (the cliffs)
    backgroundRockCount: 0,
    /// How many 'challenge rows' are in the scene (the rows that have rocks, shields, or crystals in them).
    challengeRowCount: 0,
    /// The current speed of the ship
    speed: 0.0,

    dieLeft: (Math.random()>0.5)? true : false,
    starterBayInScene: false,
    leftPressed: false,
    rightPressed: false,
}

export const sceneSetup = (fromGameOver: boolean) => {
    cameraAngleStartAnimation = 0.00;
    // Remove all references to old "challenge rows" and background Rocks
    sceneConfiguration.challengeRowCount = 0;
    sceneConfiguration.backgroundRockCount = 0;

    // Add the starter bay to the scene (the sandy shore with the rocks around it)
    scene.add(starterBay);
    sceneConfiguration.starterBayInScene = true;

    // Set the starter bay position to be close to the ship
    starterBay.position.copy(new Vector3(10, 0, 120));

    // Rotate the rocket model back to the correct orientation to play the level
    rocketModel.rotation.x = Math.PI;
    rocketModel.rotation.z = 0;

    // Set the location of the rocket model to be within the starter bay
    rocketModel.position.z = 70;
    rocketModel.position.y = 10;
    rocketModel.position.x = 0;

    // Remove any existing challenge rows from the scene
    challengeRows.forEach(x => {
        scene.remove(x.rowParent);
    });

    // Remove any existing environment Rocks from the scene
    environmentRocks.forEach(x => {
        scene.remove(x);
    })

    // Setting the length of these arrays to zero clears the array of any values
    environmentRocks.length = 0;
    challengeRows.length = 0;

    // Render some challenge rows and background Rocks into the distance
    for (let i = 0; i < 60; i++) {
        // debugger;
        addChallengeRow(sceneConfiguration.challengeRowCount++);
        addBackgroundRock(sceneConfiguration.backgroundRockCount++);
    }

    //Set the variables back to their beginning state

    // Indicates that the animation where the camera flies from the current position isn't playing
    sceneConfiguration.cameraStartAnimationPlaying = false;
    // The level isn't over (we just started it)
    sceneConfiguration.levelOver = false;
    // The rocket isn't flying away back to the mothership
    rocketModel.userData.flyingAway = false;
    // Resets the current progress of the course to 0, as we haven't yet started the level we're on
    sceneConfiguration.courseProgress = 0;

    // Reset how many things we've collected in this level to zero
    sceneConfiguration.data.shieldsCollected = 0;
    sceneConfiguration.data.crystalsCollected = 0;

    // Updates the UI to show how many things we've collected to zero.
    crystalUiElement.innerText = String(sceneConfiguration.data.crystalsCollected);
    // shieldUiElement.innerText = String(sceneConfiguration.data.shieldsCollected);

    if (!fromGameOver) {
        // Reset the camera position back to slightly infront of the ship, for the start-up animation
        camera.position.z = 50;
        camera.position.y = 12;
        camera.position.x = 15;
        camera.rotation.y = 2.5;
    } else {
        
        animateCameraFromEndToStartPosition();
    }
    
    sceneConfiguration.ready = true;
}

async function init() {
    renderer = new WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    startPanel.classList.remove('hidden');

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    // setProgress('Scene loaded!');
    document.getElementById('loadingCover')?.remove();
    document.getElementById('loadingTextContainer')?.remove();
    document.getElementById('rocketPicture')?.remove();


    // Water
    water.rotation.x = -Math.PI / 2;
    water.rotation.z = 0;
    scene.add(water);

    // Sky
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;
    const parameters = {
        elevation: 3,
        azimuth: 115
    }
    const pmremGenerator = new PMREMGenerator(renderer);

    const phi = MathUtils.degToRad(90 - parameters.elevation);
    const theta = MathUtils.degToRad(parameters.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    (water.material as ShaderMaterial).uniforms['sunDirection'].value.copy(sun).normalize();
    scene.environment = pmremGenerator.fromScene(sky as any).texture;

    (water.material as ShaderMaterial).uniforms['speed'].value = 0.0;

    
    // Rocket and mothership Scale
    rocketModel.scale.set(0.3, 0.3, 0.3);
    scene.add(rocketModel);
    scene.add(mothershipModel);

    mothershipModel.position.y = 200;
    mothershipModel.position.z = 100;
    mothershipModel.scale.set(15,15,15);
}

const animate = () => {
    requestAnimationFrame(animate);

    if (sceneConfiguration.ready) {
        
        rocketModel.userData?.mixer?.update(rocketModel.userData.clock.getDelta());
        camera.userData?.mixer?.update(camera.userData?.clock?.getDelta());
        destructionBits.forEach(particle => {
            particle.userData.mixer?.update(particle.userData.clock.getDelta());
        });
        destructionShield?.userData?.mixer?.update(destructionShield.userData.clock.getDelta());
                

        if (!sceneConfiguration.cameraStartAnimationPlaying) {
            camera.position.x = 20 * Math.cos(cameraAngleStartAnimation);
            camera.position.z = 20 * Math.sin(cameraAngleStartAnimation);
            camera.position.y = 30;
            // camera.position.y += 40;
            camera.lookAt(rocketModel.position);
            cameraAngleStartAnimation += 0.005;
            // camera.position.x = 50 * Math.cos(cameraAngleStartAnimation) + rocketModel.position.x;
            // camera.position.z = 50 * Math.sin(cameraAngleStartAnimation) + rocketModel.position.z;
            // camera.position.y = 30;
            // // camera.position.y += 40;
            // camera.lookAt(rocketModel.position);
            // cameraAngleStartAnimation += 0.0025;
        }

        if (sceneConfiguration.rocketMoving && !sceneConfiguration.levelOver) {
            let delta_x = 0;
            let target_rz = 0;
            if (sceneConfiguration.leftPressed) {
                delta_x -= sensibility;
                target_rz -= Math.PI / 4;
            }
            if (sceneConfiguration.rightPressed) {
                delta_x += sensibility;
                target_rz += Math.PI / 4;
            }
            
            rocketModel.position.x += delta_x
            rocketModel.position.x = clamp(rocketModel.position.x, -20, 25);
            
            target_rz = (rocketModel.position.x === -20 || rocketModel.position.x === +25)? 0 : target_rz;
            rocketModel.rotation.z = MathUtils.lerp(rocketModel.rotation.z, target_rz, 0.1);

            sceneConfiguration.speed += 0.001;
            sceneConfiguration.speed = clamp(sceneConfiguration.speed, 0, 10);
            sceneConfiguration.courseProgress += sceneConfiguration.speed;
            detectCollisions();
        }

        objectsMotionUpdate();
    }
    
    updateDestructionBits();
    updateWaterMaterial();
    renderer.render(scene, camera);
}


objectsInit().then(x => {
    uiInit();
    init();
    sceneSetup(false);
    animate();
})