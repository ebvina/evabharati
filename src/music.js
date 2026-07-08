import { SONG } from './config.js';

let player = null;
let isPlaying = false;
let apiReady = false;
const queue = [];

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
  player = new window.YT.Player('yt-player-container', {
    height: '1',
    width: '1',
    videoId: SONG.id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      loop: 1,
      playlist: SONG.id,
    },
    events: {
      onStateChange: (event) => {
        // Safety net: restart if loop param is ignored
        if (event.data === window.YT.PlayerState.ENDED) {
          player.seekTo(0);
          player.playVideo();
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
