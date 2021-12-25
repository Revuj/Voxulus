import EasySeeSo from "./seeso/easy-seeso";

navigator.mediaDevices
  .getUserMedia({ audio: true, video: true })
  .then(function (stream) {
    console.log("You let me use your mic!");
    init(stream);
    resolve(src_webgazer);
  })
  .catch(function (err) {
    console.log("No mic for you!");
  });

(async () => {
  const seeso = new EasySeeSo();
  await seeso.init(
    "dev_rh0cf9sardxfpnyowby4hvvzddeks7dapgu83pwm",
    afterInitialized,
    afterFailed
  );
})();

function afterInitialized() {
  console.log("sdk init success!");
}

function afterFailed() {
  console.log("sdk init fail!");
}
