
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ==========================================
// PROJECT-V | PLAYER CONTROLLER
// ==========================================

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181c22);
scene.fog = new THREE.Fog(0x181c22, 20, 65);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

// LIGHTING
const ambient = new THREE.HemisphereLight(
    0xffffff,
    0x303040,
    2
);
scene.add(ambient);

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(8, 15, 8);
sunlight.castShadow = true;
scene.add(sunlight);

// ==========================================
// ENVIRONMENT
// ==========================================

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x45494d })
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// COLLISION OBJECTS
const obstacles = [];

function createBox(x, y, z, width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const material = new THREE.MeshStandardMaterial({
        color: color
    });

    const box = new THREE.Mesh(geometry, material);

    box.position.set(x, y + height / 2, z);
    box.castShadow = true;
    box.receiveShadow = true;

    scene.add(box);

    obstacles.push({
        x,
        z,
        width,
        depth
    });

    return box;
}

// ROOM WALLS
createBox(0, 0, -20, 40, 5, 1, 0x555b62);
createBox(0, 0, 20, 40, 5, 1, 0x555b62);
createBox(-20, 0, 0, 1, 5, 40, 0x555b62);
createBox(20, 0, 0, 1, 5, 40, 0x555b62);

// COVER AND OBSTACLES
createBox(-5, 0, -5, 4, 2, 2, 0x62676b);
createBox(5, 0, -8, 3, 2, 3, 0x62676b);
createBox(0, 0, -13, 6, 2, 1, 0x62676b);
createBox(-9, 0, 5, 2, 2, 5, 0x62676b);
createBox(8, 0, 5, 4, 2, 2, 0x62676b);

// ==========================================
// PLAYER PHYSICS
// ==========================================

const player = {
    x: 0,
    y: 0,
    z: 8,

    velocityY: 0,

    speed: 4.5,
    jumpForce: 7.5,
    gravity: 22,

    height: 1.7,
    width: 0.7,

    grounded: true
};

let yaw = 0;
let pitch = 0;

const keys = {};

const playerHalf = player.width / 2;

// INPUT
window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "Space") {
        event.preventDefault();
    }
});

window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// MOUSE LOOK
renderer.domElement.addEventListener("click", () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === renderer.domElement) {
        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;

        pitch = Math.max(-1.5, Math.min(1.5, pitch));
    }
});

// ==========================================
// COLLISION DETECTION
// ==========================================

function collides(x, z) {
    for (const obstacle of obstacles) {
        const overlapX =
            Math.abs(x - obstacle.x) <
            playerHalf + obstacle.width / 2;

        const overlapZ =
            Math.abs(z - obstacle.z) <
            playerHalf + obstacle.depth / 2;

        if (overlapX && overlapZ) {
            return true;
        }
    }

    return false;
}

// ==========================================
// MOVEMENT
// ==========================================

function updatePlayer(delta) {

    // MOVEMENT DIRECTION
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

    // JUMPING
    if (keys["Space"] && player.grounded) {
        player.velocityY = player.jumpForce;
        player.grounded = false;
    }

    // GRAVITY
    player.velocityY -= player.gravity * delta;
    player.y += player.velocityY * delta;

    // GROUND COLLISION
    if (player.y <= 0) {
        player.y = 0;
        player.velocityY = 0;
        player.grounded = true;
    }

    // CAMERA POSITION
    camera.position.set(
        player.x,
        player.y + player.height,
        player.z
    );

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

// ==========================================
// GAME LOOP
// ==========================================

let previousTime = 0;

function animate(time) {
    requestAnimationFrame(animate);

    const delta = Math.min(
        (time - previousTime) / 1000,
        0.05
    );

    previousTime = time;

    updatePlayer(delta);

    renderer.render(scene, camera);
}

animate(0);

// WINDOW RESIZE
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
