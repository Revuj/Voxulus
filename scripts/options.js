import voxulus from "./voxulus.js";

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(function (stream) {
    console.log("You let me use your mic!");
  })
  .catch(function (err) {
    console.log("No mic for you!");
  });

if (annyang) {
  annyang.debug();
  console.log("We have annyang!");

  var commands = {
    "start writing": startWriting,
    "stop writing": stopWriting,
    "stop search": stopWriting,
    "new tab": startSearch,
    "open tab": startSearch,
    "start search": startSearch,
    erase: eraseStuff,
    delete: eraseStuff,
    undo: eraseStuff,
  };

  // when it's not a command
  annyang.addCallback("resultNoMatch", (userSaid) =>
    voxulus.dispatch("writeStuff", userSaid)
  );

  async function startWriting() {
    voxulus.dispatch("startWriting");
    console.log(voxulus);
  }

  async function startSearch() {
    voxulus.dispatch("startSearch");
    console.log(voxulus);
  }

  async function stopWriting() {
    voxulus.dispatch("stopWriting");
    console.log(voxulus);
  }

  async function eraseStuff() {
    voxulus.dispatch("eraseStuff");
    console.log(voxulus);
  }

  // Add Commands
  annyang.addCommands(commands);

  // Start listening
  annyang.start();
}
