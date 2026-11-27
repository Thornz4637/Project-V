import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.innerHTML = "";
document.body.appendChild(renderer.domElement);

// Floor
const floorGeometry = new THREE.BoxGeometry(20, 0.2, 20);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.position.y = -1;

scene.add(floor);

// Cube
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

cube.position.z = -5;

scene.add(cube);

camera.position.y = 1;

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
