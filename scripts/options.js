import voxulus from "./voxulus.js";

let startWritingCommands = ["start writing", "begin writing"];
let stopWritingCommands = ["stop writing", "stop search"];
let startSearchCommands = [
  "start search",
  "start searching",
  "open tab",
  "new tab",
];
let eraseStuffCommands = ["erase", "delete", "undo"];
let fasterCommand = ["faster", "father", "fast"];

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

  var commands = {};
  startWritingCommands.forEach((command) => (commands[command] = startWriting));
  stopWritingCommands.forEach((command) => (commands[command] = stopWriting));
  startSearchCommands.forEach((command) => (commands[command] = startSearch));
  eraseStuffCommands.forEach((command) => (commands[command] = eraseStuff));
  commands["scroll up"] = scrollUp;
  commands["scroll down"] = scrollDown;
  commands["stop"] = stop;
  fasterCommand.forEach((command) => (commands[command] = faster));
  commands["slower"] = slower;

  // when it's not a command
  annyang.addCallback("resultNoMatch", (userSaid) =>
    voxulus.dispatch("writeStuff", userSaid[0])
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

  async function scrollUp() {
    voxulus.dispatch("scrollUp");
    console.log(voxulus);
  }

  async function scrollDown() {
    voxulus.dispatch("scrollDown");
    console.log(voxulus);
  }

  async function stop() {
    voxulus.dispatch("stop");
    console.log(voxulus);
  }

  async function faster() {
    voxulus.dispatch("faster");
    console.log(voxulus);
  }

  async function slower() {
    voxulus.dispatch("slower");
    console.log(voxulus);
  }

  // Add Commands
  annyang.addCommands(commands);

  // Start listening
  annyang.start();
}
