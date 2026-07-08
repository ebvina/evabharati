import { SONGS } from './config.js';

let player = null;
let currentIndex = 0;
let isPlaying = false;
let onSongChange = null;
let apiReady = false;
const queue = [];

export function initMusic(callback) {
  onSongChange = callback;

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
  player = new window.YT.Player('yt-player-container', {
    height: '1',
    width: '1',
    videoId: SONGS[0].id,
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
      onReady: () => {
        if (onSongChange) onSongChange(SONGS[0]);
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          nextSong();
        }
      },
    },
  });
}

export function startMusic() {
  const play = () => {
    if (player && player.playVideo) {
      player.playVideo();
      isPlaying = true;
      if (onSongChange) onSongChange(SONGS[currentIndex]);
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

export function nextSong() {
  currentIndex = (currentIndex + 1) % SONGS.length;
  if (player && player.loadVideoById) {
    player.loadVideoById(SONGS[currentIndex].id);
    isPlaying = true;
    if (onSongChange) onSongChange(SONGS[currentIndex]);
  }
}

export function getCurrentSong() {
  return SONGS[currentIndex];
}

export function isMusicPlaying() {
  return isPlaying;
}
