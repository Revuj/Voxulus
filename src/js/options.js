import "../css/options.css";
import "regenerator-runtime/runtime";
import EasySeeSo from "seeso_test/easy-seeso";

const licenseKey = "dev_rh0cf9sardxfpnyowby4hvvzddeks7dapgu83pwm";

function showGazeInfoOnDom(gazeInfo) {
  let gazeInfoDiv = document.getElementById("gazeInfo");
  gazeInfoDiv.innerText = `Gaze Information Below
                           \nx: ${gazeInfo.x}
                           \ny: ${gazeInfo.y}
                           `;
}

function showGazeDotOnDom(gazeInfo) {
  let canvas = document.getElementById("output");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(gazeInfo.x, gazeInfo.y, 10, 0, Math.PI * 2, true);
  ctx.fill();
}

function showGaze(gazeInfo) {
  showGazeInfoOnDom(gazeInfo);
  showGazeDotOnDom(gazeInfo);
}

function onClickCalibrationBtn() {
  const userId = "YOUR_USER_ID"; // ex) 5e9easf293
  const redirectUrl = "http://localhost:8082";
  const calibrationPoint = 5;
  EasySeeSo.openCalibrationPage(licenseKey, userId, redirectUrl, calibrationPoint);
}

function parseCalibrationDataInQueryString() {
  const href = window.location.href;
  const decodedURI = decodeURI(href);
  const queryString = decodedURI.split("?")[1];
  if (!queryString) return undefined;
  const jsonString = queryString.slice("calibrationData=".length, queryString.length);
  return jsonString;
}

function onGaze(gazeInfo) {
  showGaze(gazeInfo);
}

function onDebug(FPS, latency_min, latency_max, latency_avg) {}

async function main() {
  const calibrationData = parseCalibrationDataInQueryString();

  if (calibrationData) {
    const seeSo = new EasySeeSo();
    await seeSo.init(
      licenseKey,
      async () => {
        await seeSo.setCalibrationData(calibrationData);
        await seeSo.startTracking(onGaze, onDebug);
      }, // callback when init succeeded.
      () => console.log("callback when init failed.") // callback when init failed.
    );
  } else {
    console.log("No calibration data given.");
    const calibrationButton = document.getElementById("calibrationButton");
    calibrationButton.addEventListener("click", onClickCalibrationBtn);
  }
}

(async () => {
  await main();
})();
