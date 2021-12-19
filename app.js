"use strict";

let canvasHeight;
let canvasWidth;
let canvasCounter = 0;

function addCanvas() {
  let wrapper = document.getElementById("wrapper");
  const lineBreak = document.createElement("br");
  canvasCounter += 1;
  let animationContainer = document.getElementById("animationContainer");
  if (canvasCounter > 1) animationContainer.style.visibility = "inherit";
  let slidesContainer = document.getElementById("slidesContainer");
  slidesContainer.style.visibility = "inherit";
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
  let gifAnimation = document.getElementById("gifAnimation")
  gifAnimation.src = "data:image/gif;base64," + encode64(encoder.stream().getData());
  gifAnimation.width = canvasWidth;
  gifAnimation.height = canvasHeight;
  let gifAnimationContainer = document.getElementById("gifAnimationContainer");
  gifAnimationContainer.style.visibility = "inherit";
}

let btnAddSlide = document.getElementById("canvasButton");
btnAddSlide.addEventListener("click", addCanvas);

let btnCreateAnimation = document.getElementById("createAnimationButton");
btnCreateAnimation.addEventListener("click", mergeCanvases);

const btn1d = document.querySelector('#departure1');
btn1d.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td>8</td><td>Elsa-Brändström-Str.</td><td>sofort</td>";
};

const btn1t = document.querySelector('#textRow1');
btn1t.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td colspan='3' class='textRow'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn2d = document.querySelector('#departure2');
btn2d.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td>351</td><td>Starpark</td><td>2 min</td>";
};

const btn2t = document.querySelector('#textRow2');
btn2t.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td colspan='3' class='textRow'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn3d = document.querySelector('#departure3');
btn3d.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td>34</td><td>Südpark</td><td>12:32</td>";
};

const btn3t = document.querySelector('#textRow3');
btn3t.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td colspan='3' class='textRow'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn4d = document.querySelector('#departure4');
btn4d.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td>5</td><td>Bad Dürrenberg</td><td>12:35</td>";
};

const btn4t = document.querySelector('#textRow4');
btn4t.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td colspan='3' class='textRow'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn4i = document.querySelector('#infoText4');
btn4i.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td> i </td><td colspan='2'> *** Bauarbeiten im Bereich Marktplatz *** </td>";
};

let slider = document.getElementById("slider");
let output = document.getElementById("intervalValue");
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
}