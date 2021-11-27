import voxulus from "./voxulus.js";

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(function (stream) {
    console.log("You let me use your mic!");
  })
  .catch(function (err) {
    console.log("No mic for you!");
  });

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

if (annyang) {
  annyang.debug();
  console.log("We have annyang!");

  var commands = {
    "new tab": newtab,
    "open tab": newtab,
    "start writing": startWriting,
    "stop writing": stopWriting,
    erase: eraseStuff,
    delete: eraseStuff,
    undo: eraseStuff,
    "start search": writeSearch,
  };

  let writeText = async (userSaid) => {
    let tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: writeStuff,
      args: [userSaid, voxulus],
    });
  };

  // when it's not a command
  annyang.addCallback("resultNoMatch", (userSaid) =>
    writeText.apply(null, userSaid)
  );

  function newtab() {
    window.open("", "_blank");
  }

  async function startWriting() {
    voxulus.state = "writing";
    console.log(voxulus);
  }

  async function stopWriting() {
    voxulus.state = "start";
    console.log(voxulus);
  }

  async function writeStuff(userSaid, voxulus) {
    if (voxulus.state === "writing")
      document.execCommand("insertText", false, userSaid);
  }

  async function eraseStuff() {
    let tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.execCommand("undo"),
    });
  }

  function writeSearch() {
    let q = "nice meme";
    window.open("http://google.com/search?q=" + q);
  }

  // Add Commands
  annyang.addCommands(commands);

  // Start listening
  annyang.start();
}
