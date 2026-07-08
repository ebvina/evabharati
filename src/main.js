import './style.css';
import * as THREE from 'three';
import { createScene } from './scene.js';
import { initMusic, startMusic, toggleMusic } from './music.js';
import { initSlideshow } from './slideshow.js';
import { PHOTOS, CONTACT_EMAIL } from './config.js';

const canvas = document.getElementById('canvas');
const entrance = document.getElementById('entrance');
const ui = document.getElementById('ui');
const enterBtn = document.getElementById('enter-btn');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

// Three.js scene
const scene3d = createScene(canvas);

// Load textures for 3D photo frames (10 photos in the carousel ring)
const loader = new THREE.TextureLoader();
PHOTOS.slice(0, 10).forEach((photo) => {
  loader.load(photo.src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    scene3d.addPhotoFrame(texture);
  });
});

// Music
initMusic();

// Entrance
enterBtn.addEventListener('click', () => {
  entrance.classList.add('hidden');
  ui.classList.remove('hidden');
  startMusic();
  initSlideshow();
});

// Music controls
musicToggle.addEventListener('click', () => {
  const playing = toggleMusic();
  musicIcon.textContent = playing ? '🎵' : '🔇';
});

// Contact: open the mail app directly with a pre-filled love letter
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('sender-name').value.trim();
  const message = document.getElementById('sender-message').value.trim();

  const subject = encodeURIComponent(`A message from ${name} ♡`);
  const body = encodeURIComponent(`${message}\n\n— ${name}`);

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  formStatus.textContent = 'Opening your mail app... ♡';
  formStatus.className = 'form-status success';
});
