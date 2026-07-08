import { PHOTOS } from './config.js';

const SLIDE_DURATION = 5000;

export function initSlideshow() {
  const img = document.getElementById('cinema-img');
  const bg = document.getElementById('cinema-bg');
  const caption = document.getElementById('cinema-caption');
  const progressBar = document.getElementById('progress-bar');
  const grid = document.getElementById('moments-grid');
  const cinema = document.getElementById('cinema');

  let current = 0;
  let startTime = 0;
  let animFrame = null;

  // Build moments grid
  PHOTOS.forEach((photo, i) => {
    const card = document.createElement('div');
    card.className = 'moment-card';
    card.innerHTML = `<img src="${photo.src}" alt="Moment ${i + 1}" loading="lazy" />`;
    card.addEventListener('click', () => {
      current = i;
      showSlide(true);
      cinema.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    grid.appendChild(card);
  });

  function showSlide(instant = false) {
    const photo = PHOTOS[current];

    if (instant) {
      img.style.transition = 'none';
      img.style.opacity = '0';
    }

    img.classList.remove('ken-burns');
    void img.offsetWidth;

    img.src = photo.src;
    bg.src = photo.src;
    caption.textContent = photo.caption;
    caption.classList.add('visible');

    if (instant) {
      requestAnimationFrame(() => {
        img.style.transition = 'opacity 1.2s ease, transform 8s ease';
        img.style.opacity = '1';
      });
    }

    requestAnimationFrame(() => {
      img.classList.add('ken-burns');
    });

    startTime = performance.now();
    if (animFrame) cancelAnimationFrame(animFrame);
    updateProgress();
  }

  function updateProgress() {
    const elapsed = performance.now() - startTime;
    const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    progressBar.style.width = `${pct}%`;

    if (elapsed >= SLIDE_DURATION) {
      current = (current + 1) % PHOTOS.length;
      showSlide();
      return;
    }

    animFrame = requestAnimationFrame(updateProgress);
  }

  // Preload images
  PHOTOS.forEach((p) => {
    const preload = new Image();
    preload.src = p.src;
  });

  showSlide(true);
}
