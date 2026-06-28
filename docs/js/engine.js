/**
 * skyscraper-demo/js/engine.js
 *
 * Runtime engine layer: scene/camera/renderer/controls setup, plus
 * applyTemplate(config) which renders a pure-data floor config (see
 * floor1.js / floor2.js) into the live Three.js scene.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createEngine(container) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 6, 20);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.minDistance = 6;
  controls.maxDistance = 40;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function clearScene() {
    while (scene.children.length) {
      const obj = scene.children[0];
      scene.remove(obj);
      obj.geometry?.dispose?.();
      obj.material?.dispose?.();
    }
  }

  // Consume a floor template config and render it into the scene.
  function applyTemplate(config) {
    clearScene();
    scene.background = new THREE.Color(config.theme.background);
    scene.fog = new THREE.Fog(config.theme.background, 15, 70);

    // 1. Lighting
    scene.add(new THREE.AmbientLight(config.lighting.ambient, 0.6));
    const dirLight = new THREE.DirectionalLight(config.theme.primary, config.lighting.intensity);
    dirLight.position.set(6, 14, 8);
    scene.add(dirLight);
    const accentLight = new THREE.PointLight(config.theme.secondary, 1.4, 60);
    accentLight.position.set(-8, 6, 4);
    scene.add(accentLight);

    // 2. Floor geometry from config.materials
    const floorMat = new THREE.MeshStandardMaterial({
      color: config.theme.secondary,
      metalness: 0.85,
      roughness: 0.15,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 3. Particles from config.particles
    if (config.particles) {
      const count = config.particles.count;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 60;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: config.theme.primary,
        size: 0.12,
        transparent: true,
        opacity: 0.8,
      });
      const particles = new THREE.Points(geo, mat);
      particles.userData.isParticles = true;
      scene.add(particles);
    }

    // 4. Logo from config.assets.logo — placeholder plane (no external image assets)
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshBasicMaterial({ color: config.theme.accent, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    logo.position.set(0, 8, -10);
    logo.userData.isLogo = true;
    scene.add(logo);

    // 5. Features
    if (config.features?.includes('robot_squad')) {
      for (let i = 0; i < 3; i++) {
        const bot = new THREE.Group();
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 1.8, 12),
          new THREE.MeshStandardMaterial({ color: config.theme.primary, emissive: config.theme.primary, emissiveIntensity: 0.4 })
        );
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.45, 14, 14),
          new THREE.MeshStandardMaterial({ color: config.theme.secondary })
        );
        head.position.y = 1.3;
        bot.add(body, head);
        bot.position.set(-6 + i * 6, 1, 4);
        scene.add(bot);
      }
    }
    if (config.features?.includes('stats_panels')) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 2.4),
        new THREE.MeshBasicMaterial({ color: config.theme.accent, transparent: true, opacity: 0.3, side: THREE.DoubleSide })
      );
      panel.position.set(8, 4, 0);
      panel.rotation.y = -Math.PI / 6;
      scene.add(panel);
    }
    if (config.features?.includes('threat_counter')) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 1.6),
        new THREE.MeshBasicMaterial({ color: config.theme.primary, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      );
      panel.position.set(-8, 5, 2);
      panel.rotation.y = Math.PI / 6;
      scene.add(panel);
    }

    // 6. PayPal buttons from config.payments.buttons
    const buttons = [];
    const list = config.payments?.buttons ?? [];
    list.forEach((btn, i) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 1),
        new THREE.MeshBasicMaterial({ color: btn.color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      mesh.position.set((i - (list.length - 1) / 2) * 3.5, 2.5, 6);
      mesh.userData = { isPayPal: true, url: btn.url, label: btn.label };
      scene.add(mesh);
      buttons.push(mesh);
    });

    // 7. Return modified scene (+ buttons, so payments.js can wire clicks)
    return { scene, buttons };
  }

  function animate(onFrame) {
    function loop() {
      requestAnimationFrame(loop);
      controls.update();
      if (onFrame) onFrame();
      renderer.render(scene, camera);
    }
    loop();
  }

  return { scene, camera, renderer, controls, applyTemplate, animate };
}

export default createEngine;
