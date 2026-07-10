import { SONGS } from './config.js';

// Pick a random starting song each load, avoiding the one that played last time
function pickStartIndex() {
  if (SONGS.length <= 1) return 0;
  let last = -1;
  try {
    last = parseInt(localStorage.getItem('eva_last_song'), 10);
  } catch {
    last = -1;
  }
  let idx = Math.floor(Math.random() * SONGS.length);
  if (idx === last) idx = (idx + 1) % SONGS.length;
  return idx;
}

let player = null;
let currentIndex = pickStartIndex();
let isPlaying = false;
let apiReady = false;
const queue = [];

function remember(idx) {
  try {
    localStorage.setItem('eva_last_song', String(idx));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function initMusic() {
  if (window.YT && window.YT.Player) {
    apiReady = true;
    createPlayer();
    return;
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    createPlayer();
    queue.forEach((fn) => fn());
    queue.length = 0;
  };
}

function createPlayer() {
  remember(currentIndex);
  player = new window.YT.Player('yt-player-container', {
    height: '1',
    width: '1',
    videoId: SONGS[currentIndex].id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
    },
    events: {
      onStateChange: (event) => {
        // One after another, looping back around
        if (event.data === window.YT.PlayerState.ENDED) {
          currentIndex = (currentIndex + 1) % SONGS.length;
          player.loadVideoById(SONGS[currentIndex].id);
        }
      },
      onError: () => {
        // Skip unplayable videos so the loop never stalls
        currentIndex = (currentIndex + 1) % SONGS.length;
        player.loadVideoById(SONGS[currentIndex].id);
      },
    },
  });
}

export function startMusic() {
  const play = () => {
    if (player && player.playVideo) {
      player.playVideo();
      isPlaying = true;
    }
  };

  if (apiReady && player) {
    play();
  } else {
    queue.push(play);
  }
}

export function toggleMusic() {
  if (!player) return isPlaying;

  if (isPlaying) {
    player.pauseVideo();
    isPlaying = false;
  } else {
    player.playVideo();
    isPlaying = true;
  }
  return isPlaying;
}
