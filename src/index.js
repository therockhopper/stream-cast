import './style.css';
const csv = require('csvtojson');
const Hls = require('hls.js');

const video = document.getElementById('theatre');
const muteButton = document.getElementById('muteButton');
const castButton = document.getElementById('castButton');

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYBRRnBfm_0gr0ekO7svwGlBeQ71gLufljjm3q8HBXLITV8DNyfiL9wA4Dl8-9KHV8jx0q4A_J125S/pub?output=csv';
let streams = undefined;
let activeStream = undefined;

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};

const castStream = function() {
  var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
  console.log(`cast stream ${activeStream}`);
  const mediaInfo = new chrome.cast.media.MediaInfo(
    activeStream,
    'application/vnd.apple.mpegurl',
  );
  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  console.log(request);
  castSession.loadMedia(request).then(
    function() {
      console.log('Load succeed');
    },
    function(errorCode) {
      console.log('Error code: ' + errorCode);
    },
  );
};

const initializeCastApi = function() {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
  });

  fetch(CSV_URL)
    .then(resp => resp.text())
    .then(csvString => csv().fromString(csvString))
    .then(json => {
      streams = json;
      console.log(streams);
      setActiveStream(streams[0].URL);
    });
};

const setActiveStream = function(url) {
  console.log(`play ${url}`);
  activeStream = url;
  var videoSrc = url;
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
  }
  video.volume = 1;
};

let muted = true;
muteButton.addEventListener('click', () => {
  video.muted = !muted;
  muted = !muted;
});

castButton.addEventListener('click', castStream);
