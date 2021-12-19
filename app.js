"use strict";

function addCanvas() {

  let element = document.getElementById("wrapper");
  const lineBreak = document.createElement("br");

  html2canvas(element).then(function (canvas) {
    canvasHeight = canvas.height;
    canvasWidth = canvas.width;
    createAnimationButton.hidden = false;
    document.body.appendChild(lineBreak);
    document.body.appendChild(canvas);
  });
}

function mergeCanvases() {
  var encoder = new GIFEncoder();
  encoder.setRepeat(0);
  encoder.setDelay(1500);
  let canvases = document.getElementsByTagName("canvas");

  encoder.setSize(canvasWidth, canvasHeight);
  encoder.start();

  for (let canvas of canvases) {
    // console.info(canvas.height + " " + canvas.width);
    let context = canvas.getContext("2d");
    encoder.addFrame(context);
  }

  encoder.finish();
  document.getElementById("gifAnimation").src = "data:image/gif;base64," + encode64(encoder.stream().getData());
  document.getElementById("gifAnimation").width = canvasWidth;
  document.getElementById("gifAnimation").height = canvasHeight;
  gifAnimationContainer.hidden = false;
}

var canvasHeight;
var canvasWidth;

let canvasButton = document.getElementById("canvasButton");
canvasButton.addEventListener("click", addCanvas);

var createAnimationButton = document.getElementById("createAnimationButton");
createAnimationButton.addEventListener("click", mergeCanvases);
createAnimationButton.hidden = true;

var gifAnimationContainer = document.getElementById("gifAnimationContainer");
gifAnimationContainer.hidden = true;


const btn1d = document.querySelector('#departure1');
btn1d.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td>8</td><td>Elsa-Brändström-Str.</td><td>sofort</td>";
};

const btn1t = document.querySelector('#textRow1');
btn1t.onclick = function () {
  let line = document.getElementById("tr1");
  line.innerHTML = "<td colspan='3'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn2d = document.querySelector('#departure2');
btn2d.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td>351</td><td>Starpark</td><td>2 min</td>";
};

const btn2t = document.querySelector('#textRow2');
btn2t.onclick = function () {
  let line = document.getElementById("tr2");
  line.innerHTML = "<td colspan='3'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn3d = document.querySelector('#departure3');
btn3d.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td>34</td><td>Südpark</td><td>12:32</td>";
};

const btn3t = document.querySelector('#textRow3');
btn3t.onclick = function () {
  let line = document.getElementById("tr3");
  line.innerHTML = "<td colspan='3'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn4d = document.querySelector('#departure4');
btn4d.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td>5</td><td>Bad Dürrenberg</td><td>12:35</td>";
};

const btn4t = document.querySelector('#textRow4');
btn4t.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td colspan='3'>TEXTTEXTTEXTTEXTTEXTTEXT</td>";
};

const btn4i = document.querySelector('#infoText4');
btn4i.onclick = function () {
  let line = document.getElementById("tr4");
  line.innerHTML = "<td> i </td><td colspan='2'> *** Bauarbeiten im Bereich Marktplatz *** </td>";
};