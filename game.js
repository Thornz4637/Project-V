
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ================================================
// PROJECT-V
// Tactical FPS Prototype
// ================================================

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17191c);
scene.fog = new THREE.Fog(0x17191c, 25, 65);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#17191c";
document.body.appendChild(renderer.domElement);

// ================================================
// LIGHTING
// ================================================

scene.add(
    new THREE.HemisphereLight(0xffffff, 0x34343a, 1.5)
);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
mainLight.position.set(-8, 15, 8);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
scene.add(mainLight);

// ================================================
// MATERIALS
// ================================================

const materials = {
    concrete: new THREE.MeshStandardMaterial({
        color: 0x656563,
        roughness: 0.95
    }),

    darkConcrete: new THREE.MeshStandardMaterial({
        color: 0x393d40,
        roughness: 0.95
    }),

    wood: new THREE.MeshStandardMaterial({
        color: 0x806044,
        roughness: 0.9
    }),

    metal: new THREE.MeshStandardMaterial({
        color: 0x454a4e,
        metalness: 0.65,
        roughness: 0.6
    }),

    floor: new THREE.MeshStandardMaterial({
        color: 0x555552,
        roughness: 0.95
    })
};

// ================================================
// ARENA GEOMETRY
// ================================================

const obstacles = [];

function createBox(x, y, z, width, height, depth, material) {

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    mesh.position.set(
        x,
        y + height / 2,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    obstacles.push({
        x,
        z,
        width,
        depth
    });

    return mesh;
}

// FLOOR
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    materials.floor
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// CEILING
const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    materials.darkConcrete
);

ceiling.rotation.x = -Math.PI / 2;
ceiling.position.y = 5.5;
scene.add(ceiling);

// OUTER WALLS
createBox(0, 0, -20, 40, 5.5, 1, materials.concrete);
createBox(0, 0, 20, 40, 5.5, 1, materials.concrete);
createBox(-20, 0, 0, 1, 5.5, 40, materials.concrete);
createBox(20, 0, 0, 1, 5.5, 40, materials.concrete);

// INTERIOR WALLS
createBox(-12, 0, -7, 14, 4, 0.4, materials.concrete);
createBox(12, 0, -7, 14, 4, 0.4, materials.concrete);

createBox(-10, 0, 5, 10, 4, 0.4, materials.concrete);
createBox(10, 0, 5, 10, 4, 0.4, materials.concrete);

createBox(-7, 0, -13, 0.4, 4, 10, materials.concrete);
createBox(7, 0, -13, 0.4, 4, 10, materials.concrete);

// WOODEN BARRICADES
createBox(-5, 0, 0, 3, 1.5, 0.3, materials.wood);
createBox(5, 0, -2, 3, 1.5, 0.3, materials.wood);

createBox(-10, 0, 12, 3, 1.5, 0.3, materials.wood);
createBox(10, 0, 12, 3, 1.5, 0.3, materials.wood);

// CRATES
createBox(-12, 0, -12, 2, 1.5, 2, materials.wood);
createBox(12, 0, -12, 2, 1.5, 2, materials.wood);

createBox(-3, 0, -16, 2, 1.5, 2, materials.wood);
createBox(3, 0, -16, 2, 1.5, 2, materials.wood);

// CENTRAL COVER
createBox(0, 0, -1, 1.5, 1.2, 3, materials.metal);

// METAL SUPPORTS
createBox(-17, 0, -17, 0.5, 5.5, 0.5, materials.metal);
createBox(17, 0, -17, 0.5, 5.5, 0.5, materials.metal);
createBox(-17, 0, 17, 0.5, 5.5, 0.5, materials.metal);
createBox(17, 0, 17, 0.5, 5.5, 0.5, materials.metal);

// ================================================
// INDUSTRIAL LIGHTS
// ================================================

for (let x = -12; x <= 12; x += 12) {
    for (let z = -12; z <= 12; z += 12) {

        const light = new THREE.PointLight(
            0xffe8ce,
            35,
            18
        );

        light.position.set(x, 4.8, z);
        scene.add(light);

        const fixture = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.12, 0.5),
            new THREE.MeshBasicMaterial({
                color: 0xffe8ce
            })
        );

        fixture.position.set(x, 5.2, z);
        scene.add(fixture);
    }
}

// ================================================
// PLAYER
// ================================================

const player = {
    x: 0,
    y: 0,
    z: 8,

    velocityY: 0,

    speed: 4.5,
    jumpForce: 7.5,
    gravity: 22,

    height: 1.7,
    radius: 0.35,

    grounded: true
};

camera.position.set(
    player.x,
    player.height,
    player.z
);

let yaw = 0;
let pitch = 0;

const keys = {};

// ================================================
// INPUT
// ================================================

window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "Space") {
        event.preventDefault();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

window.addEventListener("blur", () => {
    for (const key in keys) {
        keys[key] = false;
    }
});

// ================================================
// MOUSE LOOK
// ================================================

renderer.domElement.addEventListener("click", () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {

    if (document.pointerLockElement !== renderer.domElement) {
        return;
    }

    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;

    pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

// ================================================
// COLLISION
// ================================================

function collides(x, z) {

    for (const obstacle of obstacles) {

        const overlapX =
            Math.abs(x - obstacle.x) <
            player.radius + obstacle.width / 2;

        const overlapZ =
            Math.abs(z - obstacle.z) <
            player.radius + obstacle.depth / 2;

        if (overlapX && overlapZ) {
            return true;
        }
    }

    return false;
}

// ================================================
// MOVEMENT
// ================================================

function updatePlayer(delta) {

    let forward = 0;
    let sideways = 0;

    if (keys["KeyW"]) forward++;
    if (keys["KeyS"]) forward--;

    if (keys["KeyD"]) sideways++;
    if (keys["KeyA"]) sideways--;

    const length = Math.hypot(forward, sideways);

    if (length > 0) {
        forward /= length;
        sideways /= length;
    }

    const moveX =
        (-Math.sin(yaw) * forward +
        Math.cos(yaw) * sideways) *
        player.speed * delta;

    const moveZ =
        (-Math.cos(yaw) * forward -
        Math.sin(yaw) * sideways) *
        player.speed * delta;

    // HORIZONTAL COLLISION
    const nextX = player.x + moveX;

    if (!collides(nextX, player.z)) {
        player.x = nextX;
    }

    const nextZ = player.z + moveZ;

    if (!collides(player.x, nextZ)) {
        player.z = nextZ;
    }

    // JUMP
    if (keys["Space"] && player.grounded) {
        player.velocityY = player.jumpForce;
        player.grounded = false;
    }

    // GRAVITY
    player.velocityY -= player.gravity * delta;
    player.y += player.velocityY * delta;

    // GROUND DETECTION
    if (player.y <= 0) {
        player.y = 0;
        player.velocityY = 0;
        player.grounded = true;
    }

    // CAMERA
    camera.position.set(
        player.x,
        player.y + player.height,
        player.z
    );

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

// ================================================
// CROSSHAIR
// ================================================

const crosshair = document.createElement("div");

crosshair.innerHTML = "+";

Object.assign(crosshair.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    fontSize: "22px",
    fontFamily: "Arial",
    fontWeight: "300",
    pointerEvents: "none",
    textShadow: "0 0 4px black",
    zIndex: "10"
});

document.body.appendChild(crosshair);

// ================================================
// FPS COUNTER
// ================================================

const fpsDisplay = document.createElement("div");

Object.assign(fpsDisplay.style, {
    position: "fixed",
    top: "12px",
    left: "12px",
    color: "#b9c5bd",
    fontSize: "13px",
    fontFamily: "monospace",
    pointerEvents: "none",
    zIndex: "10"
});

document.body.appendChild(fpsDisplay);

let frames = 0;
let fpsTimer = 0;

// ================================================
// GAME LOOP
// ================================================

let previousTime = 0;

function animate(time) {

    requestAnimationFrame(animate);

    const delta = Math.min(
        (time - previousTime) / 1000,
        0.05
    );

    previousTime = time;

    updatePlayer(delta);

    frames++;
    fpsTimer += delta;

    if (fpsTimer >= 0.5) {
        fpsDisplay.textContent = `FPS: ${Math.round(frames / fpsTimer)}`;

        frames = 0;
        fpsTimer = 0;
    }

    renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// ================================================
// RESIZE
// ================================================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
