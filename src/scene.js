import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !IS_MOBILE,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0612');
  scene.fog = new THREE.FogExp2('#0a0612', 0.012);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );
  camera.position.z = 30;

  // ── Post-processing: bloom glow ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    IS_MOBILE ? 0.55 : 0.8,
    0.7,
    0.25
  );
  composer.addPass(bloom);

  // ── Aurora nebula backdrop ──
  const auroraGeo = new THREE.PlaneGeometry(200, 130, 96, 96);
  const auroraMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#ff5c9a') },
      uColor2: { value: new THREE.Color('#5c8dff') },
      uColor3: { value: new THREE.Color('#b78cff') },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 0.15 + uTime * 0.4) * 4.0
               + cos(pos.y * 0.12 + uTime * 0.25) * 3.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;

      float noise(vec2 p) {
        return sin(p.x * 3.1) * cos(p.y * 2.7) * 0.5 + 0.5;
      }

      void main() {
        vec2 uv = vUv;
        float t = uTime * 0.15;
        float n1 = noise(uv * 3.0 + vec2(t, -t * 0.5));
        float n2 = noise(uv * 5.0 - vec2(t * 0.7, t * 0.3));
        float wave = sin(uv.x * 5.0 + t * 2.0 + n1 * 3.0) * 0.5 + 0.5;
        float wave2 = cos(uv.y * 4.0 - t * 1.5 + n2 * 2.0) * 0.5 + 0.5;

        vec3 color = mix(uColor1, uColor2, wave);
        color = mix(color, uColor3, wave2 * 0.5);

        float glow = smoothstep(0.9, 0.2, distance(uv, vec2(0.5))) * 0.35;
        float alpha = (0.08 + wave * 0.10 + n1 * 0.06) + glow * 0.08;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const aurora = new THREE.Mesh(auroraGeo, auroraMat);
  aurora.position.z = -60;
  scene.add(aurora);

  // ── Floating hearts ──
  const heartCount = IS_MOBILE ? 45 : 110;
  const heartGeo = createHeartGeometry(0.3);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0xff6b9d,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  const hearts = new THREE.InstancedMesh(heartGeo, heartMat, heartCount);
  const heartColor = new THREE.Color();
  const heartPalette = ['#ff6b9d', '#ff8fb8', '#8faaff', '#c9a6ff'];
  const heartData = [];

  const dummy = new THREE.Object3D();
  for (let i = 0; i < heartCount; i++) {
    const x = (Math.random() - 0.5) * 90;
    const y = (Math.random() - 0.5) * 60;
    const z = (Math.random() - 0.5) * 50 - 10;
    const scale = 0.25 + Math.random() * 0.9;
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, 0, (Math.random() - 0.5) * 0.6);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    hearts.setMatrixAt(i, dummy.matrix);
    heartColor.set(heartPalette[i % heartPalette.length]);
    hearts.setColorAt(i, heartColor);
    heartData.push({
      x, y, z, scale,
      speedY: 0.008 + Math.random() * 0.025,
      swayAmp: 1 + Math.random() * 2.5,
      speedRot: (Math.random() - 0.5) * 0.02,
      rotZ: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
    });
  }
  scene.add(hearts);

  // ── Star / particle field ──
  const particleCount = IS_MOBILE ? 900 : 2600;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const pink = new THREE.Color('#ff8fb8');
  const blue = new THREE.Color('#8faaff');
  const lavender = new THREE.Color('#d4bfff');
  const white = new THREE.Color('#ffffff');

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    const c = [pink, blue, lavender, white][i % 4];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float aSize;
      varying vec3 vColor;
      uniform float uTime;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + position.x * 5.0 + position.y * 3.0);
        gl_PointSize = aSize * twinkle * (140.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float alpha = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(vColor, alpha * 0.85);
      }
    `,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Shooting stars ──
  const shootingStars = [];
  const shootMat = new THREE.MeshBasicMaterial({
    color: 0xffe0f0,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.PlaneGeometry(6, 0.06);
    const mesh = new THREE.Mesh(geo, shootMat.clone());
    mesh.visible = false;
    scene.add(mesh);
    shootingStars.push({ mesh, active: false, life: 0, vx: 0, vy: 0, nextAt: Math.random() * 6 });
  }

  function spawnShootingStar(star, elapsed) {
    star.active = true;
    star.life = 0;
    const startX = (Math.random() - 0.5) * 80;
    const startY = 20 + Math.random() * 15;
    star.mesh.position.set(startX, startY, -20 - Math.random() * 20);
    const angle = -Math.PI / 5 - Math.random() * 0.4;
    star.vx = Math.cos(angle) * (18 + Math.random() * 10);
    star.vy = Math.sin(angle) * (18 + Math.random() * 10);
    star.mesh.rotation.z = angle;
    star.mesh.visible = true;
    star.nextAt = elapsed + 3 + Math.random() * 7;
  }

  // ── Glowing rings ──
  const ringGroup = new THREE.Group();
  const ringColors = ['#ff6b9d', '#6b9dff', '#c4b5fd'];
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(14 + i * 4, 0.03, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColors[i],
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3 + i * 0.15;
    ringGroup.add(ring);
  }
  ringGroup.position.y = -4;
  scene.add(ringGroup);

  // ── Floating photo frames ──
  const photoFrames = [];
  const frameGroup = new THREE.Group();
  scene.add(frameGroup);

  const clock = new THREE.Clock();
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05) || 0.016;

    auroraMat.uniforms.uTime.value = elapsed;
    particleMat.uniforms.uTime.value = elapsed;

    // Hearts drift upward with sway
    for (let i = 0; i < heartCount; i++) {
      const d = heartData[i];
      let y = d.y + (elapsed * d.speedY * 6) % 70;
      if (y > 35) y -= 70;
      dummy.position.set(
        d.x + Math.sin(elapsed * 0.6 + d.phase) * d.swayAmp,
        y,
        d.z
      );
      dummy.rotation.set(0, Math.sin(elapsed * 0.4 + d.phase) * 0.5, d.rotZ + Math.sin(elapsed + d.phase) * 0.15);
      const pulse = 1 + Math.sin(elapsed * 2 + d.phase) * 0.08;
      dummy.scale.setScalar(d.scale * pulse);
      dummy.updateMatrix();
      hearts.setMatrixAt(i, dummy.matrix);
    }
    hearts.instanceMatrix.needsUpdate = true;

    particles.rotation.y = elapsed * 0.015;
    particles.rotation.x = Math.sin(elapsed * 0.08) * 0.04;

    ringGroup.rotation.z = elapsed * 0.08;
    ringGroup.rotation.y = elapsed * 0.05;

    // Shooting stars
    shootingStars.forEach((star) => {
      if (star.active) {
        star.life += dt;
        star.mesh.position.x += star.vx * dt;
        star.mesh.position.y += star.vy * dt;
        star.mesh.material.opacity = Math.max(0, 1 - star.life / 1.4);
        if (star.life > 1.4) {
          star.active = false;
          star.mesh.visible = false;
        }
      } else if (elapsed > star.nextAt) {
        spawnShootingStar(star, elapsed);
      }
    });

    // Camera parallax (mouse + scroll)
    const targetX = mouseX * 3;
    const targetY = -mouseY * 2 - scrollY * 0.002;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    // Photo carousel
    frameGroup.rotation.y = elapsed * 0.06;
    photoFrames.forEach((frame, i) => {
      frame.mesh.position.y = frame.baseY + Math.sin(elapsed * 0.5 + i * 0.8) * 1.2;
      frame.mesh.rotation.y = -frameGroup.rotation.y + Math.atan2(
        frame.mesh.position.x, frame.mesh.position.z
      );
    });

    composer.render();
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onResize);
  animate();

  return {
    addPhotoFrame(texture) {
      const group = new THREE.Group();
      const aspect = texture.image
        ? texture.image.width / texture.image.height
        : 1;
      const h = 5;
      const w = h * aspect;

      const borderGeo = new THREE.PlaneGeometry(w + 0.35, h + 0.35);
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0xffb3d1,
        transparent: true,
        opacity: 0.9,
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      group.add(border);

      const photoGeo = new THREE.PlaneGeometry(w, h);
      const photoMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = 0.02;
      group.add(photoMesh);

      const count = 10;
      const angle = photoFrames.length * (Math.PI * 2 / count);
      const radius = IS_MOBILE ? 16 : 22;
      const baseY = (photoFrames.length % 2 === 0 ? 2 : -3) + (Math.random() - 0.5) * 3;
      group.position.set(
        Math.cos(angle) * radius,
        baseY,
        Math.sin(angle) * radius - 6
      );

      frameGroup.add(group);
      photoFrames.push({ mesh: group, baseY });
    },
    destroy() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    },
  };
}

function createHeartGeometry(size) {
  const shape = new THREE.Shape();
  const s = size;
  shape.moveTo(0, s * 0.3);
  shape.bezierCurveTo(0, s, -s, s, -s, s * 0.3);
  shape.bezierCurveTo(-s, -s * 0.3, 0, -s * 0.7, 0, -s);
  shape.bezierCurveTo(0, -s * 0.7, s, -s * 0.3, s, s * 0.3);
  shape.bezierCurveTo(s, s, 0, s, 0, s * 0.3);
  return new THREE.ShapeGeometry(shape, 16);
}
