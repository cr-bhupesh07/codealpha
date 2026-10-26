'use strict';

/* =========================================================
   Music Player - CodeAlpha Task 4
   Uses the HTML <audio> element and local MP3 files only.
   ========================================================= */

/* ---------------------------------------------------------
   PLAYLIST
   Each song needs a title, artist and file path (src).
   The MP3 files must exist in the "songs" folder with
   exactly these names, or the player shows them as
   "Unavailable". Edit this list to match your own files.

   Optional: add  cover: 'covers/song1.jpg'  to a song to
   show your own artwork instead of the generated gradient.
   --------------------------------------------------------- */
const tracks = [
  { title: 'Sample Song 1', artist: 'Unknown Artist', src: 'songs/song1.mp3', colors: ['#7c5cff', '#22d3ee'] },
  { title: 'Sample Song 2', artist: 'Unknown Artist', src: 'songs/song2-sample.mp3', colors: ['#f472b6', '#fb923c'] }
];

// Extra info the player keeps for every song
tracks.forEach(function (track) {
  track.duration = NaN;       // filled in when the file's metadata loads
  track.unavailable = false;  // true when the file cannot be loaded
});

/* ---------- DOM elements ---------- */
const root = document.documentElement;
const audio = document.getElementById('audio');
const artwork = document.getElementById('artwork');
const coverEl = document.getElementById('cover');
const titleEl = document.getElementById('track-title');
const artistEl = document.getElementById('track-artist');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume');
const messageEl = document.getElementById('message');
const playlistEl = document.getElementById('playlist');
const playlistCount = document.getElementById('playlist-count');

/* ---------- State ---------- */
const REPEAT_MODES = ['off', 'all', 'one'];
const REPEAT_LABELS = {
  off: 'Repeat: off',
  all: 'Repeat: all songs',
  one: 'Repeat: current song'
};

let currentIndex = -1;       // index of the song that is loaded
let isShuffle = false;
let repeatMode = 'off';
let isPlayingState = false;
let isSeeking = false;       // true while the user drags the progress bar
let userWantsPlay = false;   // true when playback was requested (used to skip broken files)
let lastVolume = 0.8;        // remembered so "unmute" restores it
let shuffleBag = [];         // songs not yet played in the current shuffle round
let history = [];            // songs played before (used by Previous in shuffle mode)
let loadToken = 0;           // changes every time a new song is loaded
let failedToken = -1;        // remembers which load already reported a failure
let progressFrame = 0;

/* =========================================================
   Helpers
   ========================================================= */

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = String(total % 60).padStart(2, '0');
  if (hours > 0) {
    return hours + ':' + String(minutes).padStart(2, '0') + ':' + secs;
  }
  return minutes + ':' + secs;
}

function formatDuration(seconds) {
  return Number.isFinite(seconds) ? formatTime(seconds) : '--:--';
}

// Colors the filled part of a slider (used by Chrome, Edge, Safari)
function setFill(slider, percent) {
  slider.style.setProperty('--fill', percent + '%');
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + (type || 'info');
}

function clearMessage() {
  messageEl.textContent = '';
  messageEl.className = 'message';
}

function showNoSongsMessage() {
  showMessage(
    'None of the songs could be loaded. Add your MP3 files to the songs folder ' +
    '(for example song1.mp3 or song2.mp3), then refresh the page.',
    'error'
  );
}

/* =========================================================
   Playlist display
   ========================================================= */

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function renderPlaylist() {
  playlistEl.textContent = '';

  tracks.forEach(function (track, index) {
    const item = document.createElement('li');
    const button = createElement('button', 'track-btn');
    button.type = 'button';
    button.dataset.index = String(index);

    const indexBox = createElement('span', 'track-index');
    indexBox.appendChild(createElement('span', 'track-number', String(index + 1)));

    const eq = createElement('span', 'eq');
    eq.setAttribute('aria-hidden', 'true');
    eq.appendChild(document.createElement('i'));
    eq.appendChild(document.createElement('i'));
    eq.appendChild(document.createElement('i'));
    indexBox.appendChild(eq);

    const meta = createElement('span', 'track-meta');
    meta.appendChild(createElement('span', 'track-name', track.title));
    meta.appendChild(createElement('span', 'track-by', track.artist));

    const status = createElement('span', 'track-status');

    button.appendChild(indexBox);
    button.appendChild(meta);
    button.appendChild(status);
    item.appendChild(button);
    playlistEl.appendChild(item);
  });

  playlistCount.textContent = tracks.length + (tracks.length === 1 ? ' song' : ' songs');
}

// Updates highlight, equalizer, duration and "Unavailable" labels
function refreshPlaylist() {
  Array.from(playlistEl.children).forEach(function (item, index) {
    const track = tracks[index];
    const button = item.firstElementChild;
    const isActive = index === currentIndex;

    button.classList.toggle('active', isActive);
    button.classList.toggle('playing', isActive && isPlayingState);
    button.classList.toggle('unavailable', track.unavailable);

    if (isActive) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }

    const status = button.querySelector('.track-status');
    status.textContent = track.unavailable ? 'Unavailable' : formatDuration(track.duration);
    status.classList.toggle('missing', track.unavailable);
    status.title = track.unavailable ? 'This file could not be loaded: ' + track.src : '';

    let label = track.title + ' by ' + track.artist;
    if (track.unavailable) {
      label += ', file unavailable';
    }
    if (isActive) {
      label += ', current song';
    }
    button.setAttribute('aria-label', label);
  });
}

// Keeps the highlighted song visible inside the scrollable playlist
function scrollActiveIntoView() {
  const item = playlistEl.children[currentIndex];
  if (!item) {
    return;
  }
  const top = item.offsetTop;
  const bottom = top + item.offsetHeight;
  if (top < playlistEl.scrollTop) {
    playlistEl.scrollTop = top;
  } else if (bottom > playlistEl.scrollTop + playlistEl.clientHeight) {
    playlistEl.scrollTop = bottom - playlistEl.clientHeight;
  }
}

/* =========================================================
   Now playing display
   ========================================================= */

function updateTrackInfo(track) {
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
  root.style.setProperty('--c1', track.colors[0]);
  root.style.setProperty('--c2', track.colors[1]);

  coverEl.hidden = true;
  if (track.cover) {
    coverEl.alt = 'Album artwork for ' + track.title;
    coverEl.src = track.cover;
  } else {
    coverEl.removeAttribute('src');
  }
}

coverEl.addEventListener('load', function () {
  coverEl.hidden = false;
});

coverEl.addEventListener('error', function () {
  coverEl.hidden = true;
});

function setPlayingUI(isPlaying) {
  isPlayingState = isPlaying;
  playBtn.classList.toggle('playing', isPlaying);
  playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  artwork.classList.toggle('playing', isPlaying);
  refreshPlaylist();
}

function updateProgressUI() {
  const duration = audio.duration;
  const hasDuration = Number.isFinite(duration) && duration > 0;

  progress.disabled = !hasDuration;
  durationEl.textContent = hasDuration ? formatTime(duration) : '--:--';

  if (isSeeking) {
    return; // the user is dragging; the "input" handler updates the display
  }

  const ratio = hasDuration ? Math.min(audio.currentTime / duration, 1) : 0;
  progress.value = String(ratio * 10000);
  setFill(progress, ratio * 100);
  currentTimeEl.textContent = formatTime(audio.currentTime);
  progress.setAttribute(
    'aria-valuetext',
    hasDuration ? formatTime(audio.currentTime) + ' of ' + formatTime(duration) : 'Not available'
  );
}

function renderPlaybackProgress() {
  updateProgressUI();
  if (!audio.paused && !audio.ended) {
    progressFrame = requestAnimationFrame(renderPlaybackProgress);
  } else {
    progressFrame = 0;
  }
}

/* =========================================================
   Loading and playing songs
   ========================================================= */

function loadTrack(index, autoplay, fromHistory) {
  // Remember the previous song so Previous works in shuffle mode
  if (currentIndex >= 0 && index !== currentIndex && !fromHistory) {
    history.push(currentIndex);
    if (history.length > 50) {
      history.shift();
    }
  }

  currentIndex = index;
  loadToken += 1;
  shuffleBag = shuffleBag.filter(function (i) { return i !== index; });
  userWantsPlay = Boolean(autoplay);
  isSeeking = false;

  const track = tracks[index];

  clearMessage();
  updateTrackInfo(track);
  setPlayingUI(false);

  audio.src = track.src;
  audio.load();

  updateProgressUI();
  refreshPlaylist();
  scrollActiveIntoView();
  updateMediaSession(track);

  if (autoplay) {
    playAudio();
  }
}

function playAudio() {
  // If this file already failed to load, explain again instead of doing nothing
  if (audio.error) {
    const failed = tracks[currentIndex];
    showMessage(
      'Could not load "' + failed.title + '". Check that ' + failed.src +
      ' exists in the songs folder and is a valid MP3 file.',
      'error'
    );
    return;
  }

  userWantsPlay = true;
  const result = audio.play();
  if (result && typeof result.catch === 'function') {
    result.catch(handlePlayError);
  }
}

function pauseAudio() {
  userWantsPlay = false;
  audio.pause();
}

function togglePlay() {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
}

function handlePlayError(error) {
  if (error && error.name === 'AbortError') {
    return; // playback was interrupted by loading another song or pausing
  }
  if (error && error.name === 'NotAllowedError') {
    userWantsPlay = false;
    setPlayingUI(false);
    showMessage('Your browser blocked automatic playback. Press the play button to start.', 'info');
    return;
  }
  handleLoadFailure();
}

/* =========================================================
   Errors: missing or broken audio files
   ========================================================= */

function handleLoadFailure() {
  if (failedToken === loadToken) {
    return; // this failure was already handled
  }
  failedToken = loadToken;

  const failedTrack = tracks[currentIndex];
  failedTrack.unavailable = true;
  setPlayingUI(false);

  if (tracks.every(function (track) { return track.unavailable; })) {
    userWantsPlay = false;
    showNoSongsMessage();
    return;
  }

  showMessage(
    'Could not load "' + failedTrack.title + '". Check that ' + failedTrack.src +
    ' exists in the songs folder and is a valid MP3 file.',
    'error'
  );

  // If the person wanted music, move on to the next working song
  if (!userWantsPlay) {
    return;
  }
  const nextIndex = getNextIndex(true);
  if (nextIndex === null) {
    userWantsPlay = false;
    return;
  }
  loadTrack(nextIndex, true);
  showMessage('Skipped "' + failedTrack.title + '" because its file could not be loaded.', 'info');
}

audio.addEventListener('error', function () {
  if (audio.getAttribute('src')) {
    handleLoadFailure();
  }
});

/* =========================================================
   Choosing the next / previous song
   ========================================================= */

// Finds the next working song going forward (+1) or backward (-1), wrapping around
function findAvailable(start, step) {
  const length = tracks.length;
  for (let n = 1; n <= length; n++) {
    const index = (((start + step * n) % length) + length) % length;
    if (!tracks[index].unavailable) {
      return index;
    }
  }
  return null;
}

function refillShuffleBag() {
  shuffleBag = tracks
    .map(function (track, index) { return index; })
    .filter(function (index) {
      return index !== currentIndex && !tracks[index].unavailable;
    });
}

// Picks a random song that has not been played yet in this round
function pickShuffleIndex(allowRefill) {
  shuffleBag = shuffleBag.filter(function (index) {
    return !tracks[index].unavailable && index !== currentIndex;
  });

  if (shuffleBag.length === 0) {
    if (!allowRefill) {
      return null;
    }
    refillShuffleBag();
  }
  if (shuffleBag.length === 0) {
    return null;
  }

  const position = Math.floor(Math.random() * shuffleBag.length);
  return shuffleBag.splice(position, 1)[0];
}

// auto = true when a song ended by itself, false when the user pressed Next
function getNextIndex(auto) {
  if (isShuffle) {
    return pickShuffleIndex(!auto || repeatMode === 'all');
  }
  const index = findAvailable(currentIndex, 1);
  if (index === null) {
    return null;
  }
  // At the end of the playlist with repeat off, stop instead of wrapping
  if (auto && repeatMode === 'off' && index <= currentIndex) {
    return null;
  }
  return index;
}

function nextTrack() {
  let index = getNextIndex(false);
  if (index === null && !tracks[currentIndex].unavailable) {
    index = currentIndex; // only one working song: play it again
  }
  if (index === null) {
    showNoSongsMessage();
    return;
  }
  loadTrack(index, true);
}

function prevTrack() {
  // If the song has been playing for a few seconds, restart it first
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  let index = null;

  if (isShuffle) {
    while (history.length > 0) {
      const candidate = history.pop();
      if (!tracks[candidate].unavailable && candidate !== currentIndex) {
        index = candidate;
        break;
      }
    }
  }
  if (index === null) {
    index = findAvailable(currentIndex, -1);
  }

  if (index === null) {
    if (tracks.every(function (track) { return track.unavailable; })) {
      showNoSongsMessage();
    }
    return;
  }
  loadTrack(index, true, true);
}

function handleEnded() {
  if (repeatMode === 'one') {
    audio.currentTime = 0;
    playAudio();
    return;
  }

  const nextIndex = getNextIndex(true);

  if (nextIndex === null) {
    // End of the playlist: stop and go back to the start of the song
    userWantsPlay = false;
    audio.currentTime = 0;
    updateProgressUI();
    setPlayingUI(false);
    return;
  }
  loadTrack(nextIndex, true);
}

/* =========================================================
   Shuffle and repeat buttons
   ========================================================= */

function updateShuffleUI() {
  shuffleBtn.classList.toggle('active', isShuffle);
  shuffleBtn.setAttribute('aria-pressed', String(isShuffle));
  shuffleBtn.title = isShuffle ? 'Shuffle: on' : 'Shuffle: off';
}

function updateRepeatUI() {
  repeatBtn.dataset.mode = repeatMode;
  repeatBtn.classList.toggle('active', repeatMode !== 'off');
  repeatBtn.setAttribute('aria-label', REPEAT_LABELS[repeatMode]);
  repeatBtn.title = REPEAT_LABELS[repeatMode];
}

shuffleBtn.addEventListener('click', function () {
  isShuffle = !isShuffle;
  if (isShuffle) {
    refillShuffleBag();
  }
  updateShuffleUI();
});

repeatBtn.addEventListener('click', function () {
  const nextMode = REPEAT_MODES[(REPEAT_MODES.indexOf(repeatMode) + 1) % REPEAT_MODES.length];
  repeatMode = nextMode;
  updateRepeatUI();
});

/* =========================================================
   Volume and mute
   ========================================================= */

function updateVolumeUI() {
  const effective = audio.muted ? 0 : audio.volume;

  if (audio.volume > 0) {
    lastVolume = audio.volume;
  }

  volumeSlider.value = String(effective);
  setFill(volumeSlider, effective * 100);
  volumeSlider.setAttribute('aria-valuetext', Math.round(effective * 100) + ' percent');

  let level = 'high';
  if (effective === 0) {
    level = 'muted';
  } else if (effective < 0.5) {
    level = 'low';
  }
  muteBtn.dataset.level = level;
  muteBtn.setAttribute('aria-label', level === 'muted' ? 'Unmute' : 'Mute');
}

volumeSlider.addEventListener('input', function () {
  audio.muted = false;
  audio.volume = Number(volumeSlider.value);
});

muteBtn.addEventListener('click', function () {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    if (audio.volume === 0) {
      audio.volume = lastVolume;
    }
  } else {
    audio.muted = true;
  }
});

audio.addEventListener('volumechange', updateVolumeUI);

/* =========================================================
   Progress bar and seeking
   ========================================================= */

// While dragging: only preview the new time
progress.addEventListener('input', function () {
  const duration = audio.duration;
  if (!Number.isFinite(duration)) {
    return;
  }
  isSeeking = true;
  const ratio = Number(progress.value) / 10000;
  setFill(progress, ratio * 100);
  currentTimeEl.textContent = formatTime(ratio * duration);
});

// When the user lets go (or presses an arrow key): jump to that position
progress.addEventListener('change', function () {
  const duration = audio.duration;
  if (Number.isFinite(duration)) {
    audio.currentTime = (Number(progress.value) / 10000) * duration;
  }
  isSeeking = false;
  updateProgressUI();
});

audio.addEventListener('timeupdate', updateProgressUI);
audio.addEventListener('durationchange', updateProgressUI);

audio.addEventListener('loadedmetadata', function () {
  const track = tracks[currentIndex];
  track.duration = audio.duration;
  track.unavailable = false;
  updateProgressUI();
  refreshPlaylist();
});

/* =========================================================
   Audio element events
   ========================================================= */

audio.addEventListener('play', function () {
  setPlayingUI(true);
  if (!progressFrame) {
    progressFrame = requestAnimationFrame(renderPlaybackProgress);
  }
});

audio.addEventListener('pause', function () {
  setPlayingUI(false);
  if (progressFrame) {
    cancelAnimationFrame(progressFrame);
    progressFrame = 0;
  }
  updateProgressUI();
});

audio.addEventListener('ended', handleEnded);

/* =========================================================
   Buttons and playlist clicks
   ========================================================= */

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

playlistEl.addEventListener('click', function (event) {
  const button = event.target.closest('.track-btn');
  if (!button) {
    return;
  }
  const index = Number(button.dataset.index);

  if (index === currentIndex) {
    togglePlay();
  } else if (tracks[index].unavailable) {
    loadTrack(index, false); // shows the song and explains the problem
  } else {
    loadTrack(index, true);
  }
});

// Space bar plays or pauses when no button or field is focused
document.addEventListener('keydown', function (event) {
  if (event.code !== 'Space') {
    return;
  }
  const tag = event.target.tagName;
  if (['BUTTON', 'INPUT', 'A', 'SELECT', 'TEXTAREA'].indexOf(tag) !== -1) {
    return;
  }
  event.preventDefault();
  togglePlay();
});

/* =========================================================
   Check every file once so the playlist can show durations
   and mark files that are missing
   ========================================================= */

function preloadDurations() {
  let finished = 0;

  function done() {
    finished += 1;
    if (finished === tracks.length && tracks.every(function (track) { return track.unavailable; })) {
      showNoSongsMessage();
    }
  }

  tracks.forEach(function (track) {
    const probe = new Audio();
    probe.preload = 'metadata';

    probe.addEventListener('loadedmetadata', function () {
      track.duration = probe.duration;
      refreshPlaylist();
      done();
    }, { once: true });

    probe.addEventListener('error', function () {
      track.unavailable = true;
      refreshPlaylist();
      done();
    }, { once: true });

    probe.src = track.src;
  });
}

/* =========================================================
   Media keys / lock screen controls (where supported)
   ========================================================= */

function setupMediaSession() {
  if (!('mediaSession' in navigator)) {
    return;
  }
  const actions = {
    play: playAudio,
    pause: pauseAudio,
    previoustrack: prevTrack,
    nexttrack: nextTrack
  };
  Object.keys(actions).forEach(function (action) {
    try {
      navigator.mediaSession.setActionHandler(action, actions[action]);
    } catch (error) {
      // This action is not supported in this browser; ignore it
    }
  });
}

function updateMediaSession(track) {
  if ('mediaSession' in navigator && typeof MediaMetadata === 'function') {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist
    });
  }
}

/* =========================================================
   Start
   ========================================================= */

audio.volume = lastVolume;
updateVolumeUI();
updateShuffleUI();
updateRepeatUI();
renderPlaylist();
setupMediaSession();
loadTrack(0, false);
preloadDurations();