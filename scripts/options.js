navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(function (stream) {
    console.log("You let me use your mic!");
  })
  .catch(function (err) {
    console.log("No mic for you!");
  });
