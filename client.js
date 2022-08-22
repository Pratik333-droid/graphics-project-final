import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Stats from './jsm/libs/stats.module.js';
import { GUI } from './jsm/libs/lil-gui.module.min.js';
import { Sky } from './jsm/objects/Sky.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';

// Create a material
var textureLoader = new THREE.TextureLoader();
var map = textureLoader.load('/bricks.webp');
var material = new THREE.MeshPhongMaterial({map: map});
var loader = new OBJLoader();
loader.load( './building3.obj', function ( object ) {

  // For any meshes in the model, add our material.
  object.traverse( function ( node ) {

    if ( node.isMesh ) node.material = material;

  } );

  // Add the model to the scene.
  scene.add( object );
} );

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 15, 20);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// Orbit Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set(0, 10, 0);
controls.minDistance = 10.0;
controls.maxDistance = 200.0;

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// Creating SUN,WATER,SKY
const sun = new THREE.Vector3();
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);


// Light interaction
let uniforms = sky.material.uniforms;
const parameters = {
    inclination: 0.49,
    azimuth: 0.205
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);

function updateSun() {

    var theta = Math.PI * (parameters.inclination - 0.5);
    var phi = 2 * Math.PI * (parameters.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    // water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
}

updateSun();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();

const skyFolder = gui.addFolder('Sky');
skyFolder.add(parameters, 'inclination', 0, 0.5, 0.0001).onChange(updateSun);
skyFolder.add(parameters, 'azimuth', 0, 1, 0.0001).onChange(updateSun);
skyFolder.open();

function animate() {

    requestAnimationFrame(animate);
    // house.rotation.z += 0.005;
    render();

    stats.update();
}

function render() {
    var time = performance.now() * 0.001;
    renderer.render(scene, camera);
}
animate();