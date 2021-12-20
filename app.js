"use strict";

/*global html2canvas, GIFEncoder*/
/*eslint no-undef: "error"*/

let canvasHeight;
let canvasWidth;
let canvasCounter = 0;

let slider = document.getElementById("slider");
let intervalValue = document.getElementById("intervalValue");
intervalValue.innerText = slider.value;
slider.oninput = function () { intervalValue.innerText = this.value; };

function addCanvas() {
  let wrapper = document.getElementById("wrapper");
  const lineBreak = document.createElement("br");
  canvasCounter += 1;
  let animationContainer = document.getElementById("animationContainer");
  if (canvasCounter > 1) {
    animationContainer.style.visibility = "unset";
  }
  let slidesContainer = document.getElementById("slidesContainer");
  slidesContainer.style.display = "unset";
  let slidesCounter = document.getElementById("slides");
  slidesCounter.innerText = canvasCounter;

  html2canvas(wrapper).then(function (canvas) {
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    slidesContainer.appendChild(canvas);
    slidesContainer.appendChild(lineBreak);
  });
}

function mergeCanvases() {
  let encoder = new GIFEncoder();
  encoder.setRepeat(0);
  encoder.setDelay(slider.value);
  let canvases = document.getElementsByTagName("canvas");

  encoder.setSize(canvasWidth, canvasHeight);
  encoder.start();

  for (let canvas of canvases) {
    // console.info(canvas.height + " " + canvas.width);
    let context = canvas.getContext("2d");
    encoder.addFrame(context);
  }

  encoder.finish();
  let gifAnimation = document.getElementById("gifAnimation");
  gifAnimation.src = "data:image/gif;base64," + encode64(encoder.stream().getData());
  gifAnimation.width = canvasWidth;
  gifAnimation.height = canvasHeight;
  let gifAnimationContainer = document.getElementById("gifAnimationContainer");
  gifAnimationContainer.style.display = "unset";
}

function shiftLine() {
  let shiftLine = document.getElementById("infoText");
  shiftLine.innerText = shiftLine.innerText.slice(1);
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
  line.innerHTML = "<td>8</td><td>Elsa-Brändström-Str.</td><td>sofort</td>";
};

const btn1t = document.querySelector("#textRow1");
btn1t.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
};

const btn2d = document.querySelector("#departure2");
btn2d.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td>351</td><td>Starpark</td><td>2 min</td>";
};

const btn2t = document.querySelector("#textRow2");
btn2t.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
};

const btn3d = document.querySelector("#departure3");
btn3d.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td>34</td><td>Heide-Uniklinikum</td><td>12:32</td>";
};

const btn3t = document.querySelector("#textRow3");
btn3t.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td colspan='3' class='textRow'>text</td>";
};

const btn4d = document.querySelector("#departure4");
btn4d.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td>5</td><td>Bad Dürrenberg</td><td>12:35</td>";
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