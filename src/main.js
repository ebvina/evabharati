import './style.css';
import * as THREE from 'three';
import { createScene } from './scene.js';
import { initMusic, startMusic, toggleMusic, nextSong } from './music.js';
import { initSlideshow } from './slideshow.js';
import { PHOTOS } from './config.js';

const canvas = document.getElementById('canvas');
const entrance = document.getElementById('entrance');
const ui = document.getElementById('ui');
const enterBtn = document.getElementById('enter-btn');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const nowPlaying = document.getElementById('now-playing');
const nextSongBtn = document.getElementById('next-song');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

// Three.js scene
const scene3d = createScene(canvas);

// Load textures for 3D photo frames (first 8 photos)
const loader = new THREE.TextureLoader();
PHOTOS.slice(0, 8).forEach((photo) => {
  loader.load(photo.src, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    scene3d.addPhotoFrame(texture);
  });
});

// Music
initMusic((song) => {
  nowPlaying.textContent = song.title;
});

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

nextSongBtn.addEventListener('click', () => {
  nextSong();
});

// Contact form via FormSubmit AJAX
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formStatus.textContent = 'Sending your love...';
  formStatus.className = 'form-status';

  const formData = new FormData(contactForm);

  try {
    const res = await fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      formStatus.textContent = 'Your message has been sent with love ♡';
      formStatus.className = 'form-status success';
      contactForm.reset();
    } else {
      throw new Error('Failed');
    }
  } catch {
    formStatus.textContent = 'Could not send — please try again or email directly';
    formStatus.className = 'form-status error';
  }
});
