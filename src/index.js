import './style.css';
import 'ext-video';

const CSV_URL = process.env.CSV_URL;
const csv = require('csvtojson');
const video = document.querySelector('.theatre');

let events
let streams;
let castSession;
let activeStream;
let remotePlayer;
let remoteController;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable) {
    initializeCastApi();
  }
};

const castStream = function() {
  if (remotePlayer.isConnected) {
    const mediaInfo = new chrome.cast.media.MediaInfo(activeStream, 'application/x-mpegurl');
    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    castSession = cast.framework.CastContext.getInstance().getCurrentSession();

    console.log(`cast stream ${activeStream}`);
    console.log(request);

    castSession.loadMedia(request)
      .catch((errorCode) => {
        console.log('Error code: ' + errorCode);
      })
      .then(() => {
        console.log('Load succeed');
      }
    );
  };
};

const initializeCastApi = function() {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
  });

  events = cast.framework.RemotePlayerEventType;
  remotePlayer = new cast.framework.RemotePlayer()
  remoteController = new cast.framework.RemotePlayerController(remotePlayer)

  remoteController.addEventListener(events.IS_CONNECTED_CHANGED, castStream.bind(this))

  fetch(CSV_URL)
    .then(resp => resp.text())
    .then(csvString => csv().fromString(csvString))
    .then(json => {
      streams = json;
      console.log(streams);
      setActiveStream(streams[1].URL);
    });
};

const setActiveStream = function(url) {
  console.log(`play ${url}`);
  
  activeStream = url;
  video.src = url;
};
