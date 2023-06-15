import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Environment Map
 */
// const environmentMap = cubeTextureLoader.load([
//     'textures/environmentMaps/0/px.jpg',
//     'textures/environmentMaps/0/nx.jpg',
//     'textures/environmentMaps/0/py.jpg',
//     'textures/environmentMaps/0/ny.jpg',
//     'textures/environmentMaps/0/pz.jpg',
//     'textures/environmentMaps/0/nz.jpg',
// ])
// environmentMap.encoding = THREE.sRGBEncoding
// scene.background = environmentMap
// scene.environment = environmentMap
scene.background = new THREE.Color('#ffffff');

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

debugObject.envMapIntensity = 5;
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001)
  .name('Intensité environnement')
  .onChange(updateAllMaterials);

/**
 * Sizes
 */
const sizes = {
  width: canvas.clientWidth,
  height: canvas.clientHeight
}

/**
 * Floor
 */
const floorGeo = new THREE.PlaneGeometry(2000, 2000);
floorGeo.rotateX(-Math.PI / 2);

const floorMat = new THREE.ShadowMaterial();
floorMat.opacity = 0.06;

const floor = new THREE.Mesh(floorGeo, floorMat);
floor.receiveShadow = true;
scene.add(floor);

/**
 * Models
 */

let delorean = null;

gltfLoader.load(
  '/models-3d/rhino/rhino-scaled.gltf',
  (gltf) => {
    // Console :
    console.log('Helmet :');
    console.log(gltf);

    // Settings
    // gltf.scene.scale.set(10, 10, 10)
    // gltf.scene.position.set(0, -4, 0)
    // gltf.scene.rotation.y =  Math.PI * 0.5

    // Gui
    gui
      .add(gltf.scene.rotation, 'y')
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .name('Helmet : rotation Y');

    // Add to scene
    delorean = gltf.scene;
    scene.add(gltf.scene);

    // Update Materials
    updateAllMaterials();
  },
);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 8);
directionalLight.position.set(-5, 2, -0.7);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 40;
directionalLight.shadow.mapSize.set(1024, 1024);
scene.add(directionalLight);

const secondDirectionalLight = new THREE.DirectionalLight('#ffffff', 1);
secondDirectionalLight.position.set(5, 2, -0.7); // Position opposée sur l'axe x par rapport à la première lumière
// secondDirectionalLight.castShadow = true;
secondDirectionalLight.shadow.camera.far = 40;
secondDirectionalLight.shadow.mapSize.set(1024, 1024);
scene.add(secondDirectionalLight);

// var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5); // Le deuxième paramètre est la taille du helper
// scene.add(directionalLightHelper);

// var lightRepresentation = new THREE.DirectionalLightHelper(directionalLight, 1, 0xff0000); // Le dernier paramètre est la couleur du helper (rouge dans cet exemple)
// scene.add(lightRepresentation);

const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
scene.add(ambientLight);

gui.add(ambientLight, 'intensity').min(0).max(10).step(0.001)
  .name('Intensité ambiante');

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001)
  .name('Intensité directionnelle');
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001)
  .name('Lumière X');
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001)
  .name('Lumière Y');
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001)
  .name('Lumière Z');

window.addEventListener('resize', onResize)
function onResize() {
  // Update sizes
  // sizes.width = canvas.clientWidth;
  // sizes.height = canvas.clientHeight;

  // sizes.width = canvas.clientWidth;
  sizes.width = window.innerWidth * 0.9;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('load', onResize)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-3.5, 1, -3.5);
scene.add(camera);

// Camera gui controls --------------------------------------------------------
// var cameraControls = {
//     posX: 4,
//     posY: 1,
//     posZ: -4,
//     updateCameraPosition: function() {
//       camera.position.set(cameraControls.posX, cameraControls.posY, cameraControls.posZ);
//     }
//   };

// gui.add(cameraControls, 'posX', -10, 10).step(0.1).onChange(cameraControls.updateCameraPosition);
// gui.add(cameraControls, 'posY', -10, 10).step(0.1).onChange(cameraControls.updateCameraPosition);
// gui.add(cameraControls, 'posZ', -10, 10).step(0.1).onChange(cameraControls.updateCameraPosition);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

gui.add(renderer, 'toneMapping', {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});

renderer.physicallyCorrectLights = true;

/**
 * Boutons
 */
// Dark mode
const darkModeButton = document.querySelector('.dark-mode');
let isDarkMode = false;
const root = document.documentElement;

darkModeButton.addEventListener('click', () => {
  if (!isDarkMode) {
    isDarkMode = true
    console.log('Mode nuit activé !')
    root.style.setProperty('--primary-color', '#ffffff');
    root.style.setProperty('--secondary-color', '#252525');
    scene.background = new THREE.Color('#252525')
    gsap.to(directionalLight.position, {
      x: 5,
      duration: 1
    })
    gsap.to(secondDirectionalLight.position, {
      x: -5,
      duration: 1
    })
  } else {
    isDarkMode = false
    console.log('Mode jour activé !')
    root.style.setProperty('--primary-color', '#252525');
    root.style.setProperty('--secondary-color', '#ffffff');
    scene.background = new THREE.Color('#ffffff')
    gsap.to(directionalLight.position, {
      x: -5,
      duration: 1
    })
    gsap.to(secondDirectionalLight.position, {
      x: 5,
      duration: 1
    })

  }
})

// Reset camera
const resetCameraButton = document.querySelector('.reset-camera')

resetCameraButton.addEventListener('click', () => {
  gsap.to(camera.position, {
    x: -3.5,
    y: 1,
    z: -3.5,
    duration: 1
  })
})

// Display infos
const displayInfosButton = document.querySelector('.display-infos')
const helperPanel = document.querySelector('.helper')

displayInfosButton.addEventListener('mouseenter', () => {
  helperPanel.style.display = "flex"
  isHelperVisible = true
})

displayInfosButton.addEventListener('mouseleave', () => {
  helperPanel.style.display = "none"
  isHelperVisible = false
})

// Voir plaque
const seePlaqueButton = document.querySelector('.see-plaque')

seePlaqueButton.addEventListener('click', () => {
  gsap.to(camera.position, {
    x: -0.0891468593121543,
    y: 0.6074576004433101,
    z: 2.6611596870724576,
    duration: 1
  })
})


/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Rotation de la voiture
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.1;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// voir position camera au click sur l'écran
document.addEventListener('click', () => {
  console.log(camera.position)
})