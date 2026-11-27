
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/RoundedBoxGeometry.js";

// ==========================================
// PROJECT-V
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17191c);
scene.fog = new THREE.Fog(0x17191c, 18, 55);

const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

scene.add(camera);
camera.position.set(0, 1.7, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

// ==========================================
// LIGHTING
// ==========================================

scene.add(new THREE.HemisphereLight(0xb7c6d8, 0x252525, 1.5));

const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(-8, 15, 5);
mainLight.castShadow = true;
scene.add(mainLight);

// ==========================================
// PROCEDURAL TEXTURES
// ==========================================

function makeSurfaceTexture(kind, baseColor, repeatX, repeatY) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);

    const image = ctx.getImageData(0, 0, size, size);
    const pixels = image.data;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const n = (Math.random() - 0.5) * (kind === "metal" ? 30 : 38);

            pixels[i] = Math.max(0, Math.min(255, pixels[i] + n));
            pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + n));
            pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + n));
        }
    }

    ctx.putImageData(image, 0, 0);

    if (kind === "wood") {
        for (let i = 0; i < 95; i++) {
            const y = Math.random() * size;

            ctx.strokeStyle = `rgba(25, 13, 6, ${0.035 + Math.random() * 0.12})`;
            ctx.lineWidth = 1 + Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                size * 0.25, y + (Math.random() - 0.5) * 18,
                size * 0.7, y + (Math.random() - 0.5) * 18,
                size, y + (Math.random() - 0.5) * 12
            );
            ctx.stroke();
        }

        for (let i = 0; i < 12; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;

            ctx.strokeStyle = "rgba(30, 17, 8, 0.22)";
            ctx.beginPath();
            ctx.ellipse(
                x, y,
                5 + Math.random() * 9,
                2 + Math.random() * 4,
                0, 0, Math.PI * 2
            );
            ctx.stroke();
        }

    } else if (kind === "metal") {
        for (let i = 0; i < 240; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const len = 4 + Math.random() * 65;

            ctx.strokeStyle = Math.random() > 0.5
                ? "rgba(220,230,235,0.10)"
                : "rgba(0,0,0,0.20)";

            ctx.lineWidth = 0.5 + Math.random() * 1.4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + len, y + (Math.random() - 0.5) * 2);
            ctx.stroke();
        }

    } else {
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 8 + Math.random() * 65;

            const gradient = ctx.createRadialGradient(
                x, y, 0, x, y, radius
            );

            gradient.addColorStop(
                0,
                kind === "floor"
                    ? "rgba(8,10,12,0.20)"
                    : "rgba(8,10,12,0.15)"
            );

            gradient.addColorStop(1, "rgba(8,10,12,0)");

            ctx.fillStyle = gradient;
            ctx.fillRect(
                x - radius,
                y - radius,
                radius * 2,
                radius * 2
            );
        }

        for (let i = 0; i < 90; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;

            ctx.strokeStyle = "rgba(220,220,215,0.055)";
            ctx.lineWidth = 0.5 + Math.random() * 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
                x + (Math.random() - 0.5) * 35,
                y + 4 + Math.random() * 28
            );
            ctx.stroke();
        }
    }

    const edge = ctx.createRadialGradient(
        size / 2, size / 2, size * 0.18,
        size / 2, size / 2, size * 0.72
    );

    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,0.16)");

    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    return texture;
}

// Generate textures
const concreteTexture = makeSurfaceTexture("concrete", "#777875", 3, 2);
const darkConcreteTexture = makeSurfaceTexture("concrete", "#44484a", 3, 2);
const floorTexture = makeSurfaceTexture("floor", "#555653", 7, 7);
const woodTexture = makeSurfaceTexture("wood", "#896747", 2, 2);
const metalTexture = makeSurfaceTexture("metal", "#41464a", 2, 3);

// ==========================================
// MATERIALS
// ==========================================

const concrete = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: concreteTexture,
    bumpMap: concreteTexture,
    bumpScale: 0.055,
    roughness: 0.98
});

const darkConcrete = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: darkConcreteTexture,
    bumpMap: darkConcreteTexture,
    bumpScale: 0.045,
    roughness: 0.96
});

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: floorTexture,
    bumpMap: floorTexture,
    bumpScale: 0.035,
    roughness: 0.98
});

const wood = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: woodTexture,
    bumpMap: woodTexture,
    bumpScale: 0.035,
    roughness: 0.9
});

const metal = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: metalTexture,
    bumpMap: metalTexture,
    bumpScale: 0.018,
    metalness: 0.72,
    roughness: 0.48
});

const black = new THREE.MeshStandardMaterial({
    color: 0x101215,
    metalness: 0.35,
    roughness: 0.5
});

const polymer = new THREE.MeshStandardMaterial({
    color: 0x292d30,
    roughness: 0.8
});

const accent = new THREE.MeshStandardMaterial({
    color: 0x50575c,
    metalness: 0.6,
    roughness: 0.45
});

// ==========================================
// ARENA
// ==========================================

const obstacles = [];

function createBox(x, y, z, w, h, d, material, solid = true) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    if (solid) {
        obstacles.push({
            minX: x - w / 2,
            maxX: x + w / 2,
            minZ: z - d / 2,
            maxZ: z + d / 2
        });
    }

    return mesh;
}

// Floor and ceiling
createBox(0, -0.25, 0, 40, 0.5, 40, floorMaterial, false);
createBox(0, 6, 0, 40, 0.3, 40, darkConcrete, false);

// Outer walls
createBox(0, 3, -20, 40, 6, 0.5, concrete);
createBox(0, 3, 20, 40, 6, 0.5, concrete);
createBox(-20, 3, 0, 0.5, 6, 40, concrete);
createBox(20, 3, 0, 0.5, 6, 40, concrete);

// Internal walls and corridors
createBox(-11, 2, -8, 0.5, 4, 13, darkConcrete);
createBox(-11, 2, 8, 0.5, 4, 13, darkConcrete);

createBox(10, 2, -10, 0.5, 4, 12, darkConcrete);
createBox(10, 2, 8, 0.5, 4, 12, darkConcrete);

createBox(0, 2, -11, 10, 4, 0.5, concrete);
createBox(4, 2, 3, 8, 4, 0.5, darkConcrete);

// Cover
createBox(-5, 0.8, -3, 3, 1.6, 1.2, wood);
createBox(5, 0.8, -5, 3, 1.6, 1.2, wood);
createBox(-5, 0.8, 7, 3, 1.6, 1.2, wood);
createBox(6, 0.8, 9, 3, 1.6, 1.2, wood);

createBox(0, 0.7, 0, 2.5, 1.4, 1, darkConcrete);
createBox(-2, 0.6, -8, 2, 1.2, 1, wood);
createBox(8, 0.6, -2, 1.5, 1.2, 2, wood);

// Metal support pillars
for (const x of [-15, -5, 5, 15]) {
    for (const z of [-15, 0, 15]) {
        createBox(x, 3, z, 0.35, 6, 0.35, metal);
    }
}

// Ceiling lights
for (const x of [-12, 0, 12]) {
    for (const z of [-12, 0, 12]) {
        const light = new THREE.PointLight(0xdde8ff, 35, 12);
        light.position.set(x, 5.5, z);
        scene.add(light);

        const fixture = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.12, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xdce6f0 })
        );

        fixture.position.set(x, 5.85, z);
        scene.add(fixture);
    }
}

// ==========================================
// PLAYER
// ==========================================

const player = {
    x: 0,
    y: 0,
    z: 8,
    velocityY: 0,
    speed: 4.5,
    jumpForce: 7.5,
    height: 1.7,
    radius: 0.35,
    grounded: true
};

let yaw = 0;
let pitch = 0;

const keys = {};
let mouseDX = 0;
let mouseDY = 0;

document.addEventListener("keydown", e => {
    keys[e.code] = true;
});

document.addEventListener("keyup", e => {
    keys[e.code] = false;
});

document.addEventListener("mousemove", e => {
    if (document.pointerLockElement === renderer.domElement) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;

        pitch = Math.max(-1.5, Math.min(1.5, pitch));

        mouseDX += e.movementX;
        mouseDY += e.movementY;
    }
});

renderer.domElement.addEventListener("click", () => {
    renderer.domElement.requestPointerLock();
});

// ==========================================
// COLLISION
// ==========================================

function collides(x, z) {
    for (const box of obstacles) {
        const closestX = Math.max(box.minX, Math.min(x, box.maxX));
        const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));

        const dx = x - closestX;
        const dz = z - closestZ;

        if (dx * dx + dz * dz < player.radius * player.radius) {
            return true;
        }
    }

    return false;
}

// ==========================================
// FICTIONAL COMPACT SMG VIEW MODEL
// ==========================================

const weapon = new THREE.Group();
camera.add(weapon);

const weaponLight = new THREE.PointLight(0xffffff, 2.2, 4);
weaponLight.position.set(-1, 1, 1);
camera.add(weaponLight);

const gunBody = new THREE.MeshStandardMaterial({
    color: 0x25292d,
    metalness: 0.65,
    roughness: 0.38
});

const gunPolymer = new THREE.MeshStandardMaterial({
    color: 0x171a1d,
    metalness: 0.15,
    roughness: 0.72
});

const gunMetal = new THREE.MeshStandardMaterial({
    color: 0x555b60,
    metalness: 0.85,
    roughness: 0.3
});

const gunRubber = new THREE.MeshStandardMaterial({
    color: 0x101214,
    roughness: 0.95
});

const gunLens = new THREE.MeshBasicMaterial({
    color: 0x69a8bd
});

function gunPart(parent, size, pos, material, radius = 0.025) {
    const geo = new RoundedBoxGeometry(
        size[0], size[1], size[2], 4, radius
    );

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
}

function gunCylinder(parent, radius, length, pos, material) {
    const geo = new THREE.CylinderGeometry(
        radius, radius, length, 24
    );

    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(...pos);
    parent.add(mesh);
    return mesh;
}

// Main receiver
gunPart(weapon, [0.24, 0.22, 0.58], [0, 0, 0], gunBody, 0.045);

// Upper receiver
gunPart(weapon, [0.21, 0.11, 0.49], [0, 0.13, -0.035], gunMetal);

// Front handguard
gunPart(weapon, [0.22, 0.18, 0.38], [0, -0.015, -0.40], gunPolymer, 0.04);

// Rear stock
gunPart(weapon, [0.19, 0.15, 0.28], [0, 0.015, 0.39], gunPolymer);
gunPart(weapon, [0.23, 0.20, 0.07], [0, 0.015, 0.56], gunRubber);

// Front assembly
gunCylinder(weapon, 0.045, 0.25, [0, 0.035, -0.68], gunMetal);
gunCylinder(weapon, 0.065, 0.09, [0, 0.035, -0.83], gunRubber);

// Magazine
gunPart(weapon, [0.14, 0.32, 0.17], [0, -0.245, 0.04], gunRubber, 0.04);
gunPart(weapon, [0.145, 0.035, 0.18], [0, -0.41, 0.04], gunMetal);

// Grip
const gunGrip = gunPart(
    weapon, [0.13, 0.25, 0.15],
    [0, -0.22, 0.23], gunPolymer, 0.035
);
gunGrip.rotation.x = -0.18;

// Optic
gunPart(weapon, [0.14, 0.07, 0.15], [0, 0.235, -0.06], gunRubber);
gunPart(weapon, [0.09, 0.09, 0.09], [0, 0.30, -0.06], gunMetal);

gunPart(weapon, [0.065, 0.06, 0.015],
    [0, 0.30, -0.11], gunLens);

// Side panels
gunPart(weapon, [0.025, 0.08, 0.23],
    [0.13, 0.015, -0.35], gunMetal, 0.008);

gunPart(weapon, [0.025, 0.08, 0.23],
    [-0.13, 0.015, -0.35], gunPolymer, 0.008);

// Top rail
gunPart(weapon, [0.075, 0.025, 0.38],
    [0, 0.205, -0.27], gunRubber, 0.008);

weapon.traverse(obj => {
    if (obj.isMesh) {
        obj.material = obj.material.clone();
        obj.material.depthTest = true;
        obj.renderOrder = 10;
    }
});

weapon.position.set(0.48, -0.37, -0.72);
weapon.rotation.set(0.02, -0.06, 0);

// ==========================================
// HUD
// ==========================================

const hud = document.createElement("div");

hud.style.cssText = `
    position: fixed;
    top: 14px;
    left: 16px;
    color: #e7edf2;
    font: 14px monospace;
    background: rgba(0,0,0,0.45);
    padding: 9px 12px;
    border-radius: 4px;
    pointer-events: none;
`;

hud.innerHTML = "PROJECT-V<br>FPS: --";
document.body.appendChild(hud);

const crosshair = document.createElement("div");

crosshair.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    width: 5px;
    height: 5px;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
`;

document.body.appendChild(crosshair);

// ==========================================
// MOVEMENT + WEAPON ANIMATION
// ==========================================

const clock = new THREE.Clock();

let fpsFrames = 0;
let fpsTimer = 0;
let fps = 0;
let walkTime = 0;

const smooth = (a, b, t) => a + (b - a) * t;

function update(delta) {
    const forward = new THREE.Vector3(
        -Math.sin(yaw), 0, -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
        Math.cos(yaw), 0, -Math.sin(yaw)
    );

    const move = new THREE.Vector3();

    if (keys["KeyW"]) move.add(forward);
    if (keys["KeyS"]) move.sub(forward);
    if (keys["KeyD"]) move.add(right);
    if (keys["KeyA"]) move.sub(right);

    const moving = move.lengthSq() > 0;

    if (moving) {
        move.normalize().multiplyScalar(player.speed * delta);

        const nextX = player.x + move.x;
        const nextZ = player.z + move.z;

        if (!collides(nextX, player.z)) player.x = nextX;
        if (!collides(player.x, nextZ)) player.z = nextZ;

        walkTime += delta * 9;
    }

    if (keys["Space"] && player.grounded) {
        player.velocityY = player.jumpForce;
        player.grounded = false;
    }

    player.velocityY -= 22 * delta;
    player.y += player.velocityY * delta;

    if (player.y <= 0) {
        player.y = 0;
        player.velocityY = 0;
        player.grounded = true;
    }

    camera.position.set(
        player.x,
        player.y + player.height,
        player.z
    );

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    const swayX = THREE.MathUtils.clamp(
        mouseDX * 0.0007, -0.08, 0.08
    );

    const swayY = THREE.MathUtils.clamp(
        mouseDY * 0.0007, -0.08, 0.08
    );

    const bobX = moving ? Math.cos(walkTime * 0.5) * 0.012 : 0;
    const bobY = moving ? Math.abs(Math.sin(walkTime)) * 0.018 : 0;

    weapon.position.x = smooth(
        weapon.position.x,
        0.48 - swayX + bobX,
        Math.min(1, delta * 10)
    );

    weapon.position.y = smooth(
        weapon.position.y,
        -0.37 - swayY - bobY,
        Math.min(1, delta * 10)
    );

    weapon.rotation.y = smooth(
        weapon.rotation.y,
        -0.06 - swayX * 0.4,
        Math.min(1, delta * 8)
    );

    weapon.rotation.x = smooth(
        weapon.rotation.x,
        0.02 + swayY * 0.4,
        Math.min(1, delta * 8)
    );

    mouseDX *= 0.65;
    mouseDY *= 0.65;
}

// ==========================================
// MAIN LOOP
// ==========================================

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    update(delta);

    fpsFrames++;
    fpsTimer += delta;

    if (fpsTimer >= 0.5) {
        fps = Math.round(fpsFrames / fpsTimer);
        hud.innerHTML = `PROJECT-V<br>FPS: ${fps}`;
        fpsFrames = 0;
        fpsTimer = 0;
    }

    renderer.render(scene, camera);
}

animate();

// ==========================================
// RESIZE
// ==========================================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
