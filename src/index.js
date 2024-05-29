import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

async function setupWebcam() {
  const webcamElement = document.getElementById("webcam");
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigatorAny.webkitGetUserMedia ||
      navigatorAny.mozGetUserMedia ||
      navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { video: true },
        (stream) => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener("loadeddata", () => resolve(), false);
        },
        (error) => reject(error)
      );
    } else {
      reject();
    }
  });
}

async function runObjectDetection() {
  await setupWebcam();
  const model = await cocoSsd.load();
  const webcamElement = document.getElementById("webcam");
  const canvasElement = document.getElementById("canvas");
  const context = canvasElement.getContext("2d");

  async function detectFrame() {
    const predictions = await model.detect(webcamElement);
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context.drawImage(
      webcamElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    predictions.forEach((prediction) => {
      context.beginPath();
      context.rect(...prediction.bbox);
      context.lineWidth = 2;
      context.strokeStyle = "green";
      context.fillStyle = "green";
      context.stroke();
      context.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        prediction.bbox[0],
        prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
      );
    });
    requestAnimationFrame(detectFrame);
  }

  detectFrame();
}

runObjectDetection();
