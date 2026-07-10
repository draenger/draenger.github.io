import * as THREE from 'https://unpkg.com/three@0.179.1/build/three.module.js';
import { animate, stagger } from 'https://cdn.jsdelivr.net/npm/motion@latest/+esm';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function createStarSprite() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.16, 'rgba(255,60,240,0.96)');
  gradient.addColorStop(0.38, 'rgba(0,229,255,0.5)');
  gradient.addColorStop(0.7, 'rgba(32,246,163,0.18)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildGalaxyGeometry(count, config) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const color = new THREE.Color();
  const {
    arms,
    spread,
    thickness,
    twist,
    coreBias,
    hueShift,
  } = config;

  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    const arm = (i % arms) / arms * Math.PI * 2;
    const radius = Math.pow(t, 0.58) * spread + coreBias;
    const angle = arm + radius * twist + (Math.random() - 0.5) * 0.18;
    const height = (Math.random() - 0.5) * thickness * (0.25 + t * 0.9);
    const x = Math.cos(angle) * radius;
    const y = height;
    const z = Math.sin(angle) * radius;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const mix = Math.min(1, 0.15 + t * 0.85);
    const armTint = (i % arms) / Math.max(1, arms - 1);
    const hue = hueShift + mix * 0.18 + Math.sin(arm * 1.7) * 0.04 + armTint * 0.06;
    const saturation = 0.6 + mix * 0.28;
    const lightness = 0.48 + mix * 0.28 + Math.sin(t * 7.0) * 0.02;
    color.setHSL((hue + 1) % 1, saturation, lightness);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    sizes[i] = 0.06 + Math.random() * 0.12 + mix * 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  return geometry;
}

function initGalaxyBackground() {
  const container = document.querySelector('#hero-galaxy');
  if (!container) return null;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050816, 0.16);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.4, 8.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const group = new THREE.Group();
  scene.add(group);

  const innerCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    })
  );
  group.add(innerCore);

  const glowCore = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x7c8cff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(glowCore);

  const diskGroup = new THREE.Group();
  group.add(diskGroup);

  const starTexture = createStarSprite();

  const makeStars = (count, config, materialOverrides = {}) => {
    const geometry = buildGalaxyGeometry(count, config);
    const material = new THREE.PointsMaterial({
      size: 0.14,
      map: starTexture,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.92,
      sizeAttenuation: true,
      ...materialOverrides,
    });
    return new THREE.Points(geometry, material);
  };

  const mainGalaxy = makeStars(9000, {
    arms: 4,
    spread: 4.8,
    thickness: 1.0,
    twist: 2.8,
    coreBias: 0.15,
    hueShift: 0.82,
  }, { size: 0.11, opacity: 0.88 });
  mainGalaxy.rotation.x = 0.32;
  mainGalaxy.rotation.z = -0.22;
  diskGroup.add(mainGalaxy);

  const halo = makeStars(2400, {
    arms: 6,
    spread: 5.9,
    thickness: 2.0,
    twist: 1.4,
    coreBias: 0.55,
    hueShift: 0.52,
  }, { size: 0.08, opacity: 0.48 });
  halo.rotation.x = -0.16;
  halo.rotation.z = 0.08;
  diskGroup.add(halo);

  const dust = makeStars(1600, {
    arms: 5,
    spread: 6.3,
    thickness: 2.5,
    twist: 0.85,
    coreBias: 0.95,
    hueShift: 0.15,
  }, { size: 0.06, opacity: 0.26 });
  dust.rotation.x = 0.5;
  dust.rotation.z = 0.4;
  diskGroup.add(dust);

  const nebula = makeStars(2600, {
    arms: 7,
    spread: 6.8,
    thickness: 3.2,
    twist: 0.55,
    coreBias: 1.15,
    hueShift: 0.95,
  }, { size: 0.18, opacity: 0.18 });
  nebula.rotation.x = -0.38;
  nebula.rotation.z = 0.58;
  diskGroup.add(nebula);

  const lightA = new THREE.PointLight(0x7c8cff, 20, 24, 1.6);
  lightA.position.set(3, 1.6, 4.5);
  scene.add(lightA);

  const lightB = new THREE.PointLight(0x22c55e, 12, 22, 1.6);
  lightB.position.set(-2.5, -1.2, 3.2);
  scene.add(lightB);

  const ambient = new THREE.AmbientLight(0xffffff, 1.35);
  scene.add(ambient);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = container.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
  };

  const onResize = () => resize();
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);
  resize();

  if (gsap && ScrollTrigger) {
    gsap.to(container, {
      y: 42,
      scale: 1.04,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  let raf = 0;
  const tick = () => {
    raf = window.requestAnimationFrame(tick);
    const time = performance.now() * 0.001;

    group.rotation.y = Math.sin(time * 0.08) * 0.18 + pointer.x * 0.34;
    group.rotation.x = 0.16 + pointer.y * -0.18;
    group.rotation.z = -0.12 + Math.sin(time * 0.12) * 0.05;

    diskGroup.rotation.z += 0.0018;
    diskGroup.rotation.x = 0.32 + Math.sin(time * 0.22) * 0.03;
    mainGalaxy.material.opacity = 0.82 + Math.sin(time * 1.6) * 0.03;
    halo.material.opacity = 0.46 + Math.sin(time * 1.2) * 0.02;
    dust.material.opacity = 0.22 + Math.sin(time * 1.4) * 0.015;
    nebula.material.opacity = 0.16 + Math.sin(time * 0.9) * 0.02;

    innerCore.scale.setScalar(1 + Math.sin(time * 2.1) * 0.04);
    glowCore.scale.setScalar(1.02 + Math.sin(time * 1.7) * 0.06);

    renderer.render(scene, camera);
  };

  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    starTexture.dispose();
    mainGalaxy.geometry.dispose();
    mainGalaxy.material.dispose();
    halo.geometry.dispose();
    halo.material.dispose();
    dust.geometry.dispose();
    dust.material.dispose();
    nebula.geometry.dispose();
    nebula.material.dispose();
    innerCore.geometry.dispose();
    innerCore.material.dispose();
    glowCore.geometry.dispose();
    glowCore.material.dispose();
    container.removeChild(renderer.domElement);
  };
}

function initHeroHologram() {
  const canvas = document.querySelector('#hero-holo-canvas');
  if (!canvas) return null;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040712, 0.23);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.18, 7.6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const root = new THREE.Group();
  root.scale.set(0.9, 0.62, 0.9);
  scene.add(root);

  const shell = new THREE.Group();
  root.add(shell);

  const coreGeo = new THREE.IcosahedronGeometry(1.05, 2);
  const shellGeo = new THREE.IcosahedronGeometry(1.48, 1);
  const ringGeo = new THREE.TorusGeometry(2.0, 0.03, 8, 220);
  const haloGeo = new THREE.TorusGeometry(1.38, 0.025, 8, 220);
  const beamGeo = new THREE.PlaneGeometry(0.08, 4.6);

  const core = new THREE.Mesh(
    coreGeo,
    new THREE.MeshBasicMaterial({
      color: 0x87f7ff,
      wireframe: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  shell.add(core);

  const shellMesh = new THREE.Mesh(
    shellGeo,
    new THREE.MeshBasicMaterial({
      color: 0xff74ea,
      wireframe: true,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  shell.add(shellMesh);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.84, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x0df2ff,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  shell.add(glow);

  const ringA = new THREE.Mesh(
    ringGeo,
    new THREE.MeshBasicMaterial({
      color: 0x7ef4ff,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  ringA.rotation.x = Math.PI * 0.5;
  shell.add(ringA);

  const ringB = new THREE.Mesh(
    haloGeo,
    new THREE.MeshBasicMaterial({
      color: 0xff4fd8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  ringB.rotation.y = Math.PI * 0.28;
  ringB.rotation.z = Math.PI * 0.18;
  shell.add(ringB);

  const beam = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfff3a3,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  beam.position.y = -1.8;
  shell.add(beam);

  const beamTop = beam.clone();
  beamTop.position.y = 1.8;
  beamTop.scale.y = 0.65;
  shell.add(beamTop);

  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 420;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleOffsets = new Float32Array(particleCount);
  const particleSpeeds = new Float32Array(particleCount);
  const particleRadii = new Float32Array(particleCount);
  const particleColors = new Float32Array(particleCount * 3);
  const particleColor = new THREE.Color();

  for (let i = 0; i < particleCount; i += 1) {
    const arm = (i % 4) / 4 * Math.PI * 2;
    const radius = 0.28 + Math.pow(Math.random(), 0.65) * 2.65;
    const angle = arm + radius * 2.35 + (Math.random() - 0.5) * 0.42;
    const x = Math.cos(angle) * radius;
    const y = (Math.random() - 0.5) * 0.16 * (0.45 + Math.random() * 0.55);
    const z = Math.sin(angle) * radius;
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;
    particleOffsets[i] = Math.random() * Math.PI * 2;
    particleSpeeds[i] = 0.35 + Math.random() * 0.7;
    particleRadii[i] = radius;
    particleColor.setHSL((0.48 + radius * 0.10 + Math.random() * 0.16) % 1, 0.95, 0.58 + Math.random() * 0.12);
    particleColors[i * 3] = particleColor.r;
    particleColors[i * 3 + 1] = particleColor.g;
    particleColors[i * 3 + 2] = particleColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  const particleBasePositions = particlePositions.slice();

  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      size: 0.1,
      map: createStarSprite(),
      transparent: true,
      vertexColors: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  shell.add(particles);

  const scanLine = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({
      color: 0x7ef4ff,
      transparent: true,
      opacity: 0.26,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scanLine.position.y = -2.35;
  scanLine.scale.y = 0.18;
  shell.add(scanLine);

  const scanPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.0, 0.24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  scanPlane.position.z = 0.5;
  shell.add(scanPlane);

  const lightA = new THREE.PointLight(0x7ef4ff, 3.5, 18, 1.5);
  lightA.position.set(2.5, 1.8, 4.2);
  scene.add(lightA);

  const lightB = new THREE.PointLight(0xff4fd8, 2.4, 18, 1.5);
  lightB.position.set(-2.2, -1.4, 3.8);
  scene.add(lightB);

  const ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
  };

  const onResize = () => resize();
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);
  resize();

  if (gsap && ScrollTrigger) {
    gsap.to(canvas, {
      y: 28,
      scale: 1.02,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  let raf = 0;
  const tick = () => {
    raf = window.requestAnimationFrame(tick);
    const time = performance.now() * 0.001;

    root.rotation.y = Math.sin(time * 0.18) * 0.28 + pointer.x * 0.45;
    root.rotation.x = 0.12 + pointer.y * -0.22;
    root.rotation.z = -0.06 + Math.sin(time * 0.24) * 0.05;

    shell.rotation.y += 0.0035;
    shell.rotation.x = Math.sin(time * 0.2) * 0.08;

    core.rotation.x = time * 0.55;
    core.rotation.y = time * 0.35;
    shellMesh.rotation.y = -time * 0.28;

    glow.scale.setScalar(1 + Math.sin(time * 2.2) * 0.06);
    ringA.rotation.z = time * 0.42;
    ringB.rotation.x = Math.PI * 0.5 + Math.sin(time * 0.75) * 0.18;

    beam.position.y = Math.sin(time * 1.85) * 1.9;
    beam.rotation.z = 0.2 + Math.sin(time * 0.35) * 0.18;
    beam.material.opacity = 0.14 + Math.sin(time * 2.6) * 0.07;

    beamTop.position.y = -beam.position.y;
    beamTop.rotation.z = -beam.rotation.z;
    beamTop.material.opacity = 0.11 + Math.sin(time * 2.1 + 0.9) * 0.05;

    scanLine.position.y = -2.4 + ((time * 0.65) % 4.8);
    scanLine.material.opacity = 0.16 + Math.sin(time * 3.1) * 0.06;
    scanPlane.position.y = Math.sin(time * 1.15) * 0.25;
    scanPlane.material.opacity = 0.06 + Math.sin(time * 2.4) * 0.03;

    const positions = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i += 1) {
      const base = i * 3;
      const offset = particleOffsets[i];
      const speed = particleSpeeds[i];
      const radius = particleRadii[i];
      const wobble = Math.sin(time * speed + offset) * 0.055;
      const spin = time * (0.18 + speed * 0.12) + offset;
      const bx = particleBasePositions[base];
      const by = particleBasePositions[base + 1];
      const bz = particleBasePositions[base + 2];
      positions[base] = bx * 0.9 + Math.cos(spin) * radius * 0.1;
      positions[base + 1] = by + wobble;
      positions[base + 2] = bz * 0.9 + Math.sin(spin) * radius * 0.1;
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  };

  tick();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    coreGeo.dispose();
    shellGeo.dispose();
    ringGeo.dispose();
    haloGeo.dispose();
    beamGeo.dispose();
    particleGeo.dispose();
    particles.material.dispose();
  };
}

function setupMotion() {
  animate(
    '#hero .hero-tag',
    { opacity: [0, 1], y: [14, 0], filter: ['blur(10px)', 'blur(0px)'] },
    { duration: 0.7, easing: 'ease-out' }
  );

  animate(
    '#hero h1',
    { opacity: [0, 1], y: [18, 0], filter: ['blur(12px)', 'blur(0px)'] },
    { delay: 0.08, duration: 0.85, easing: 'ease-out' }
  );

  animate(
    '#hero .hero-sub',
    { opacity: [0, 1], y: [18, 0] },
    { delay: 0.18, duration: 0.75, easing: 'ease-out' }
  );

  animate(
    '#hero .hero-chips .chip',
    { opacity: [0, 1], y: [10, 0], scale: [0.96, 1] },
    { delay: stagger(0.03), duration: 0.45, easing: 'ease-out' }
  );

  animate(
    '#hero .hero-cta .btn',
    { opacity: [0, 1], y: [12, 0], scale: [0.98, 1] },
    { delay: stagger(0.08), duration: 0.5, easing: 'ease-out' }
  );

  animate(
    '#hero .hero-holo-frame',
    { opacity: [0, 1], y: [20, 0], scale: [0.96, 1] },
    { delay: 0.12, duration: 0.85, easing: 'ease-out' }
  );
}

function setupScrollMotion() {
  if (!gsap || !ScrollTrigger) return;

  gsap.from('.projects-grid .card', {
    y: 42,
    opacity: 0,
    scale: 0.98,
    duration: 0.8,
    stagger: 0.09,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#projects',
      start: 'top 76%',
    },
  });

  gsap.from('#signals .signal', {
    y: 28,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#signals',
      start: 'top 78%',
    },
  });

  gsap.from('.skill-block', {
    y: 24,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#skills',
      start: 'top 76%',
    },
  });

  gsap.from('.stat', {
    y: 18,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 76%',
    },
  });
}

async function init() {
  if (!prefersReducedMotion) {
    setupMotion();
    setupScrollMotion();
    initGalaxyBackground();
    initHeroHologram();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
