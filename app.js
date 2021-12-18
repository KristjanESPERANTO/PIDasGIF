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
    console.info(canvas.height + " " + canvas.width);
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