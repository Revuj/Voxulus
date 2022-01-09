import voxulus from "./voxulus.js";

let startWritingCommands = ["start writing", "begin writing"];
let stopWritingCommands = ["stop writing", "stop search"];
let startSpellingCommands = ["start spelling", "begin spelling"];
let stopSpellingCommands = ["stop spelling"];
let startSearchCommands = [
  "start search",
  "start searching",
  "open tab",
  "new tab",
];
let clickCommands = [
  "click",
  "quick",
  "creek",
  "crake",
  "quake",
  "kwik",
  "craic",
  "craig",
  "kreg",
];
let eraseStuffCommands = ["erase", "delete", "undo"];
let fasterCommands = ["faster", "father", "fast"];
let mediaForwardCommands = ["skip *query seconds", "forward *query seconds"];

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
  startSpellingCommands.forEach((command) => (commands[command] = startSpelling));
  stopSpellingCommands.forEach((command) => (commands[command] = stopSpelling));
  startSearchCommands.forEach((command) => (commands[command] = startSearch));
  eraseStuffCommands.forEach((command) => (commands[command] = eraseStuff));
  clickCommands.forEach((command) => (commands[command] = click));
  commands["scroll up"] = scrollUp;
  commands["scroll down"] = scrollDown;
  commands["stop"] = stop;
  fasterCommands.forEach((command) => (commands[command] = faster));
  commands["slower"] = slower;
  commands["pause"] = pause;
  commands["play"] = play;
  commands["volume up"] = volumeUp;
  commands["volume down"] = volumeDown;
  mediaForwardCommands.forEach((command) => (commands[command] = mediaForward));
  commands["back *query seconds"] = mediaBackward;
  commands["zoom in"] = zoomIn;
  commands["zoom out"] = zoomOut;
  commands["close tab"] = closeTab;
  commands["close tab :number"] = {
    regexp: /^close tab (1|2|3|4|5|6|7|8|9)$/,
    callback: closeTab,
  };
  commands["select tab :number"] = {
    regexp: /^select tab (1|2|3|4|5|6|7|8|9)$/,
    callback: selectTab,
  };
  commands["reload"] = reload;
  commands["go back"] = goBack;
  commands["go forward"] = goForward;
  commands["submit"] = submit;
  commands["next"] = next;

  commands["newline"] = newline;
  commands["whitespace"] = whitespace;
  commands["at sign"] = atSign;
  commands["dot"] = dot;


  // when it's not a command
  annyang.addCallback("resultNoMatch", (userSaid) =>
    voxulus.dispatch("writeStuff", userSaid[0])
  );

  async function newline() {
    voxulus.dispatch("writeStuff", "\n")
    console.log(voxulus);
  }

  async function whitespace() {
    voxulus.dispatch("writeStuff", " ")
    console.log(voxulus);
  }

  async function atSign() {
    voxulus.dispatch("writeStuff", "@")
    console.log(voxulus);
  }

  async function dot() {
    voxulus.dispatch("writeStuff", ".")
    console.log(voxulus);
  }

  async function startWriting() {
    voxulus.dispatch("startWriting");
    console.log(voxulus);
  }

  async function startSearch() {
    voxulus.dispatch("startSearch");
    console.log(voxulus);
  }

  async function startSpelling() {
    voxulus.dispatch("startSpelling");
    console.log(voxulus);
  }

  async function stopWriting() {
    voxulus.dispatch("stopWriting");
    console.log(voxulus);
  }

  async function stopSpelling() {
    voxulus.dispatch("stopSpelling");
    console.log(voxulus);
  }

  async function eraseStuff() {
    voxulus.dispatch("eraseStuff");
    console.log(voxulus);
  }

  async function click() {
    voxulus.dispatch("click");
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

  async function pause() {
    voxulus.dispatch("pause");
    console.log(voxulus);
  }

  async function play() {
    voxulus.dispatch("play");
    console.log(voxulus);
  }

  async function volumeUp() {
    voxulus.dispatch("volumeUp");
    console.log(voxulus);
  }

  async function volumeDown() {
    voxulus.dispatch("volumeDown");
    console.log(voxulus);
  }

  async function mediaForward(query) {
    voxulus.dispatch("mediaForward", query);
    console.log(voxulus);
  }

  async function mediaBackward(query) {
    voxulus.dispatch("mediaBackward", query);
    console.log(voxulus);
  }

  async function zoomIn() {
    voxulus.dispatch("zoomIn");
    console.log(voxulus);
  }

  async function zoomOut() {
    voxulus.dispatch("zoomOut");
    console.log(voxulus);
  }

  async function closeTab(number) {
    voxulus.dispatch("closeTab", number);
    console.log(voxulus);
  }

  async function selectTab(number) {
    voxulus.dispatch("selectTab", number);
    console.log(voxulus);
  }

  async function reload() {
    voxulus.dispatch("reload");
    console.log(voxulus);
  }

  async function goBack() {
    voxulus.dispatch("goBack");
    console.log(voxulus);
  }

  async function goForward() {
    voxulus.dispatch("goForward");
    console.log(voxulus);
  }

  async function submit() {
    voxulus.dispatch("submit");
    console.log(voxulus);
  }

  async function next() {
    voxulus.dispatch("next");
    console.log(voxulus);
  }

  // Add Commands
  annyang.addCommands(commands);

  // Start listening
  annyang.start();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("request: ", request);
});
