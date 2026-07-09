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

// Contact: open the mail app directly with a pre-filled love letter.
// Falls back to Gmail / copy when no mail app is configured (common on desktop).
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('sender-name').value.trim();
  const message = document.getElementById('sender-message').value.trim();

  const subjectRaw = `A message from ${name} ♡`;
  const bodyRaw = `${message}\n\n— ${name}`;
  const subject = encodeURIComponent(subjectRaw);
  const body = encodeURIComponent(bodyRaw);

  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${subject}&body=${body}`;

  // Gmail compose opens directly — works everywhere, no mail app needed
  window.open(gmailUrl, '_blank', 'noopener');

  formStatus.className = 'form-status success';
  formStatus.innerHTML = `
    Opening Gmail with your message... ♡<br />
    <span class="form-fallback">
      Prefer another way?
      <a href="${mailtoUrl}">Use your mail app</a>
      or
      <button type="button" id="copy-mail-btn">copy the message</button>
    </span>
  `;

  document.getElementById('copy-mail-btn').addEventListener('click', async () => {
    const text = `To: ${CONTACT_EMAIL}\nSubject: ${subjectRaw}\n\n${bodyRaw}`;
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById('copy-mail-btn').textContent = 'copied ♡';
    } catch {
      window.prompt('Copy this message:', text);
    }
  });
});
