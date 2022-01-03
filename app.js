"use strict";

/*global html2canvas, GIFEncoder, encode64*/
/*eslint no-undef: "error"*/

let canvasHeight;
let canvasWidth;
let canvasCounter = 0;

const slider = document.getElementById("slider");
let intervalValue = document.getElementById("intervalValue");
intervalValue.innerText = slider.value + " ms";
slider.oninput = function () { intervalValue.innerText = this.value + " ms"; };

let slidesCounter = document.getElementById("slides");

function deleteSlide(e) {
  e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
  canvasCounter = canvasCounter - 1;
  slidesCounter.innerText = canvasCounter;
}

function addCanvas() {
  let wrapper = document.getElementById("wrapper");

  const gridContainer = document.createElement("div");
  gridContainer.className = "grid-container";

  const canvasContainer = document.createElement("div");
  canvasContainer.className = "grid-item";
  gridContainer.appendChild(canvasContainer);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "grid-item";
  gridContainer.appendChild(buttonContainer);

  const deleteButton = document.createElement("button");
  deleteButton.onclick = function () { deleteSlide(this); };
  deleteButton.innerText = "Delete";
  buttonContainer.appendChild(deleteButton);

  canvasCounter += 1;
  let animationContainer = document.getElementById("animationContainer");
  if (canvasCounter > 1) {
    animationContainer.style.visibility = "unset";
  }
  let slidesContainer = document.getElementById("slidesContainer");
  slidesContainer.style.display = "unset";
  slidesContainer.appendChild(gridContainer);
  slidesCounter.innerText = canvasCounter;

  html2canvas(wrapper).then(function (canvas) {
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    canvasContainer.appendChild(canvas);
  });
}

function mergeCanvases() {
  let canvases = document.getElementsByTagName("canvas");

  let gifEncoder = new GIFEncoder();

  var gif = new GIF({
    workers: 1,
    workerScript: './third-party/gif-js/gif.worker.js',
    quality: 10
  });

  gifEncoder.setRepeat(0);
  gifEncoder.setDelay(slider.value);
  gifEncoder.setSize(canvasWidth, canvasHeight);
  gifEncoder.start();

  for (let canvas of canvases) {
    let context = canvas.getContext("2d");
    //gifEncoder.addFrame(context);
    gif.addFrame(canvas, {delay: parseInt(slider.value, 10)});
  }

  finalizeGif(gifEncoder, gif);

  let browserSupportsWebmDecoding = true;
  let maxVideoLenght = 15000;
  let videoLenght = 0;
  let frameDuration = parseInt(slider.value, 10);
  let videoWriter = new WebMWriter({
    quality: 0.75,
    frameDuration: frameDuration
  });


  while (videoLenght + canvases.length * frameDuration <= maxVideoLenght && browserSupportsWebmDecoding) {
    for (let canvas of canvases) {
      try {
        videoWriter.addFrame(canvas);
        videoLenght += frameDuration;
      }
      catch (err) {
        browserSupportsWebmDecoding = false;
      }
    }
  }


  if (browserSupportsWebmDecoding) {
    finalizeVideo(videoWriter);
  } else {
    document.getElementById("video-container").innerText = "Your browser does not support decoding of WebP Base64 URLs. As a result, the animation cannot be created as a video.";
    document.getElementById("video-download-container").innerText = "";
  }

  let gifAnimationContainer = document.getElementById("gifAnimationContainer");
  gifAnimationContainer.style.display = "unset";
}

function finalizeGif(gifEncoder, gif) {

  gif.on('finished', function(blob) {
    let gifAnimation2 = document.getElementById("gifAnimation2");
    gifAnimation2.src = URL.createObjectURL(blob);
    
    //window.open(URL.createObjectURL(blob));
  });

  gif.render();

/*
  gifEncoder.finish();
  let gifAnimation = document.getElementById("gifAnimation");
  gifAnimation.src = "data:image/gif;base64," + encode64(gifEncoder.stream().getData());
  gifAnimation.width = canvasWidth;
  gifAnimation.height = canvasHeight;
  document.getElementById('gifSize').innerHTML = "~" + Math.ceil(gifAnimation.src.length / 1300) + " kB";
  */
}

function finalizeVideo(videoWriter) {
  videoWriter.complete().then(function (webMBlob) {
    let url = (window.webkitURL || window.URL).createObjectURL(webMBlob);
    document.getElementById('video').src = url;
    document.getElementById('downloadVideo').href = url;
    document.getElementById('videoSize').innerHTML = "~" + Math.ceil(webMBlob.size / 1024) + " kB";
  });
}

function shiftLine() {
  let shiftLine = document.getElementById("infoText");
  // Replace spaces to prevent problems when spaces are at the beginning at a string while shifting
  shiftLine.innerText = shiftLine.innerText.replaceAll(" ", "\u00a0");
  // Remove the first character
  shiftLine.innerText = shiftLine.innerText.slice(1);
}

function shiftLineAddCanvas() {
  shiftLine();
  addCanvas();
}

function downloadCanvas() {
  let canvas = document.getElementById("gifAnimation");
  let image = canvas.src;

  let tmpLink = document.createElement("a");
  tmpLink.download = "image.gif";
  tmpLink.href = image;

  document.body.appendChild(tmpLink);
  tmpLink.click();
  document.body.removeChild(tmpLink);
}

const btn1d = document.querySelector("#departure1");
btn1d.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td class='lineCell'>8</td><td class='destinationCell'>Elsa-Brändström-Str.</td><td>sofort</td>";
};

const btn1t = document.querySelector("#textRow1");
btn1t.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
};

const btn2d = document.querySelector("#departure2");
btn2d.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td class='lineCell'>351</td><td class='destinationCell'>Starpark</td><td>2 min</td>";
};

const btn2t = document.querySelector("#textRow2");
btn2t.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
};

const btn3d = document.querySelector("#departure3");
btn3d.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td class='lineCell'>34</td><td class='destinationCell'>Heide-Uniklinikum</td><td>12:32</td>";
};

const btn3t = document.querySelector("#textRow3");
btn3t.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
};

const btn4d = document.querySelector("#departure4");
btn4d.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td class='lineCell'>5</td><td class='destinationCell'>Bad Dürrenberg</td><td>12:35</td>";
  let shiftButton = document.getElementById("shiftButton");
  shiftButton.style.display = "none";
};

const btn4t = document.querySelector("#textRow4");
btn4t.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
  let shiftButton = document.getElementById("shiftButton");
  shiftButton.style.display = "none";
};

const btn4i = document.querySelector("#infoText4");
btn4i.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td> i </td><td colspan='2' id='infoText'>***  Bauarbeiten im Bereich Marktplatz   ***  Bauarbeiten im Bereich Marktplatz *** Bauarbeiten im Bereich Marktplatz ***</td>";
  let shiftButton = document.getElementById("shiftButton");
  shiftButton.style.display = "unset";
};

const fontSize1 = document.querySelector("#fontSize1");
fontSize1.oninput = function () {
  let line = document.getElementById("tr1");
  line.style.fontSize = fontSize1.value + "px";
};

const fontSize2 = document.querySelector("#fontSize2");
fontSize2.oninput = function () {
  let line = document.getElementById("tr2");
  line.style.fontSize = fontSize2.value + "px";
};

const fontSize3 = document.querySelector("#fontSize3");
fontSize3.oninput = function () {
  let line = document.getElementById("tr3");
  line.style.fontSize = fontSize3.value + "px";
};

const fontSize4 = document.querySelector("#fontSize4");
fontSize4.oninput = function () {
  let line = document.getElementById("tr4");
  line.style.fontSize = fontSize4.value + "px";
};
