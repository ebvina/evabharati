import * as THREE from 'three';

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.z = 30;

  // Aurora gradient background plane
  const auroraGeo = new THREE.PlaneGeometry(120, 80, 64, 64);
  const auroraMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color('#ff6b9d') },
      uColor2: { value: new THREE.Color('#6b9dff') },
      uColor3: { value: new THREE.Color('#c4b5fd') },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 0.3 + uTime * 0.5) * 2.0
               + cos(pos.y * 0.2 + uTime * 0.3) * 1.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      void main() {
        float wave = sin(vUv.x * 4.0 + uTime * 0.4) * 0.5 + 0.5;
        float wave2 = cos(vUv.y * 3.0 + uTime * 0.3) * 0.5 + 0.5;
        vec3 color = mix(uColor1, uColor2, wave);
        color = mix(color, uColor3, wave2 * 0.4);
        float alpha = 0.15 + wave * 0.1;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const aurora = new THREE.Mesh(auroraGeo, auroraMat);
  aurora.position.z = -40;
  scene.add(aurora);

  // Floating hearts
  const heartCount = 80;
  const heartGeo = createHeartGeometry(0.3);
  const heartMat = new THREE.MeshBasicMaterial({
    color: 0xff6b9d,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const hearts = new THREE.InstancedMesh(heartGeo, heartMat, heartCount);
  const heartData = [];

  const dummy = new THREE.Object3D();
  for (let i = 0; i < heartCount; i++) {
    const x = (Math.random() - 0.5) * 80;
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 40 - 10;
    const scale = 0.3 + Math.random() * 0.8;
    dummy.position.set(x, y, z);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    hearts.setMatrixAt(i, dummy.matrix);
    heartData.push({
      x, y, z, scale,
      speedY: 0.01 + Math.random() * 0.03,
      speedRot: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
    });
  }
  scene.add(hearts);

  // Particle field
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const pink = new THREE.Color('#ff6b9d');
  const blue = new THREE.Color('#6b9dff');
  const lavender = new THREE.Color('#c4b5fd');

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    const c = [pink, blue, lavender][i % 3];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Floating photo frames in 3D
  const photoFrames = [];
  const frameGroup = new THREE.Group();
  scene.add(frameGroup);

  const clock = new THREE.Clock();
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    auroraMat.uniforms.uTime.value = elapsed;

    // Animate hearts
    for (let i = 0; i < heartCount; i++) {
      const d = heartData[i];
      dummy.position.set(
        d.x + Math.sin(elapsed * d.speedY * 10 + d.phase) * 2,
        d.y + elapsed * d.speedY * 5,
        d.z
      );
      if (dummy.position.y > 30) dummy.position.y = -30;
      dummy.rotation.z += d.speedRot;
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      hearts.setMatrixAt(i, dummy.matrix);
    }
    hearts.instanceMatrix.needsUpdate = true;

    // Rotate particles gently
    particles.rotation.y = elapsed * 0.02;
    particles.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

    // Camera parallax
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Animate photo frames
    photoFrames.forEach((frame, i) => {
      frame.mesh.rotation.y = elapsed * 0.15 + i * 1.2;
      frame.mesh.position.y = frame.baseY + Math.sin(elapsed * 0.5 + i) * 1.5;
    });

    frameGroup.rotation.y = elapsed * 0.03;

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onResize);
  animate();

  return {
    addPhotoFrame(texture) {
      const group = new THREE.Group();
      const aspect = texture.image
        ? texture.image.width / texture.image.height
        : 1;
      const w = 4;
      const h = w / aspect;

      const frameGeo = new THREE.PlaneGeometry(w + 0.3, h + 0.3);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0xff6b9d,
        transparent: true,
        opacity: 0.8,
      });
      const frameBorder = new THREE.Mesh(frameGeo, frameMat);
      group.add(frameBorder);

      const photoGeo = new THREE.PlaneGeometry(w, h);
      const photoMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const photoMesh = new THREE.Mesh(photoGeo, photoMat);
      photoMesh.position.z = 0.01;
      group.add(photoMesh);

      const angle = photoFrames.length * (Math.PI * 2 / 8);
      const radius = 18;
      group.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 10,
        Math.sin(angle) * radius - 5
      );
      group.lookAt(0, group.position.y, 0);

      frameGroup.add(group);
      photoFrames.push({ mesh: group, baseY: group.position.y });
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

  const geo = new THREE.ShapeGeometry(shape, 16);
  return geo;
}
