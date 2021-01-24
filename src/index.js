import './style.css';
import 'ext-video';

const CSV_URL = process.env.CSV_URL;
const csv = require('csvtojson');
const videoEl = document.querySelector('.theatre');
const streamsEl = document.querySelector('.streams');
const categoriesEl = document.querySelector('.categories');

let events;
let streams;
let castSession;
let activeStream;
let remotePlayer;
let remoteController;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
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
    const mediaInfo = new chrome.cast.media.MediaInfo(
      activeStream,
      'application/x-mpegurl',
    );
    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    castSession = cast.framework.CastContext.getInstance().getCurrentSession();

    console.log(`cast stream ${activeStream}`);
    console.log(request);

    castSession
      .loadMedia(request)
      .catch(errorCode => {
        console.log('Error code: ' + errorCode);
      })
      .then(() => {
        console.log('Load succeed');
      });
  }
};

const initializeCastApi = function() {
  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
  });

  events = cast.framework.RemotePlayerEventType;
  remotePlayer = new cast.framework.RemotePlayer();
  remoteController = new cast.framework.RemotePlayerController(remotePlayer);

  remoteController.addEventListener(
    events.IS_CONNECTED_CHANGED,
    castStream.bind(this),
  );

  fetch(CSV_URL)
    .then(resp => resp.text())
    .then(csvString => csv().fromString(csvString))
    .then(json => {
      streams = json;
      console.log(streams);
      setStreamList(streams)
      setActiveStream(streams[0].url);
    });
};



const setStreamList = function(streams) {
  streamsEl.innerHTML = '';

  streams.forEach((stream) => {
    setStream(stream)
    setType(stream)
  })
};

const setStream = function(stream) {
  const streamEl = document.createElement('div');

  streamEl.classList.add('stream');
  streamEl.innerText = `${stream.name}: ${stream.description}`;
  streamEl.url = stream.url;
  streamEl.addEventListener('click', (e) => {
    setActiveStream(e.target.url)
  })

  streamsEl.append(streamEl);
};

const setType = function(stream) {
  const categoryEl = document.createElement('div');

  categoryEl.classList.add('category');
  categoryEl.innerText = stream.category;
  categoryEl.addEventListener('click', (e) => {
    console.dir(e.target)
  })

  categoriesEl.append(categoryEl);
};

const setActiveStream = function(url) {
  console.log(`play ${url}`);

  activeStream = url;
  videoEl.src = url;
};
