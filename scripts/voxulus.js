import { executeScript, sendClickMessage, getCurrentTab, getTabByIndex } from "./utilities.js";

let scroll;

const setNewInterval = (speed) => {
  scroll = setInterval(() => executeScript((s) => window.scrollBy(0, s), [speed]), 100);
};

const clearVisualFeedback = (clearPulse) => {
  executeScript(
    (clearPulse) => {
      const pointer = document.querySelector(".facepointer-pointer");
      const pulse = document.querySelector(".facepointer-pointer-pulse");

      pointer.style.background = "red";
      pointer.style.borderColor = "red";
      pulse.style.background = "rgba(255, 0, 0, 0.788)";
      if (clearPulse) pulse.style.display = "none";
    },
    [clearPulse]
  );
};

const visualListeningFeedback = () => {
  executeScript(() => {
    const pulse = document.querySelector(".facepointer-pointer-pulse");
    pulse.style.display = "block";
  });
};

const visualFeedback = (clearPulse) => {
  executeScript(() => {
    const pointer = document.querySelector(".facepointer-pointer");
    const pulse = document.querySelector(".facepointer-pointer-pulse");

    pointer.style.background = "rgb(0,200,0)";
    pointer.style.borderColor = "rgb(0,200,0)";
    pulse.style.background = "rgb(0,255,0)";
    pulse.style.display = "block";
  });
  setTimeout(clearVisualFeedback.bind(null, clearPulse), 1000);
};

const machine = {
  state: "IDLE",
  transitions: {
    IDLE: {
      startWriting() {
        this.state = "WRITING";
        visualListeningFeedback();
      },
      startSearch() {
        this.state = "SEARCH";
        visualListeningFeedback();
      },
      async eraseStuff() {
        executeScript(() => document.execCommand("undo"));
      },
      async click() {
        sendClickMessage({ type: "click" });
      },
      async scrollDown() {
        this.state = "SCROLL_DOWN";
        this.speed = 50;
        setNewInterval(this.speed);
      },
      async scrollUp() {
        this.state = "SCROLL_UP";
        this.speed = 50;
        setNewInterval(-this.speed);
      },
      async pause() {
        executeScript(() => {
          const video = document.getElementsByTagName("video");
          const audio = document.getElementsByTagName("audio");
          const elements = [].concat(...video, ...audio);
          elements.forEach((e) => e.pause());
        });
      },
      async play() {
        executeScript(() => {
          const video = document.getElementsByTagName("video");
          const audio = document.getElementsByTagName("audio");
          const elements = [].concat(...video, ...audio);
          elements.forEach((e) => e.play());
        });
      },
      async volumeUp() {
        executeScript(() => {
          const video = document.getElementsByTagName("video");
          const audio = document.getElementsByTagName("audio");
          const elements = [].concat(...video, ...audio);
          elements.forEach((e) => (e.volume = Math.min(1, e.volume + 0.2)));
        });
      },
      async volumeDown() {
        executeScript(() => {
          const video = document.getElementsByTagName("video");
          const audio = document.getElementsByTagName("audio");
          const elements = [].concat(...video, ...audio);
          elements.forEach((e) => (e.volume = Math.max(0, e.volume - 0.2)));
        });
      },
      async mediaBackward(query) {
        const seconds = parseFloat(query);
        if (seconds < 0) return;
        executeScript(
          (seconds) => {
            const video = document.getElementsByTagName("video");
            const audio = document.getElementsByTagName("audio");
            const elements = [].concat(...video, ...audio);
            elements.forEach((e) => (e.currentTime -= seconds));
          },
          [seconds]
        );
      },
      async mediaForward(query) {
        const seconds = parseFloat(query);
        if (seconds < 0) return;
        executeScript(
          (seconds) => {
            const video = document.getElementsByTagName("video");
            const audio = document.getElementsByTagName("audio");
            const elements = [].concat(...video, ...audio);
            elements.forEach((e) => (e.currentTime += seconds));
          },
          [seconds]
        );
      },
      async zoomIn() {
        chrome.tabs.setZoom((await chrome.tabs.getZoom()) * 1.15);
      },
      async zoomOut() {
        chrome.tabs.setZoom((await chrome.tabs.getZoom()) / 1.15);
      },
      async closeTab(tabNumber) {
        // undefined for current
        let tabIdToClose;
        if (tabNumber !== undefined) {
          tabIdToClose = (await getTabByIndex(parseInt(tabNumber) - 1)).id;
        } else {
          tabIdToClose = (await getCurrentTab()).id;
        }
        chrome.tabs.remove(tabIdToClose);
      },
      async selectTab(tabNumber) {
        let tabIdToSelect = (await getTabByIndex(parseInt(tabNumber) - 1)).id;
        chrome.tabs.update(tabIdToSelect, { active: true });
      },
      async reload() {
        chrome.tabs.reload();
      },
      async goBack() {
        chrome.tabs.goBack();
      },
      async goForward() {
        chrome.tabs.goForward();
      },
      async submit() {
        executeScript(() => {
          let after = false;
          let found = false;
          function deepFirstSearch(node) {
            if (node) {
              if (found) return;
              if (node === document.activeElement) {
                if (node.form) {
                  node.form.submit();
                  return;
                }
                after = true;
              }
              if (
                after &&
                (node.getAttribute("type") === "submit" ||
                  node.tagName === "BUTTON" ||
                  node.tagName === "A")
              ) {
                node.click();
                found = true;
              }
              var children = node.children;
              for (var i = 0; i < children.length; i++) deepFirstSearch(children[i]);
            }
          }
          deepFirstSearch(document);
        }, []);
      },
      async next() {
        executeScript(() => {
          var sheet = document.createElement("style");
          sheet.innerHTML = ".voxulus-border {border: 2px solid lightblue;}";
          document.body.appendChild(sheet);

          let after = false;
          let found = false;
          function deepFirstSearch(node) {
            if (node) {
              if (found) return;
              if (
                after &&
                (node.getAttribute("type") === "submit" ||
                  node.tagName === "BUTTON" ||
                  node.tagName === "A" ||
                  node.tagName === "INPUT" ||
                  node.contentEditable === "true" ||
                  node.role === "textbox")
              ) {
                node.focus();
                node.classList.add("voxulus-border");
                found = true;
                setTimeout(() => {
                  node.classList.remove("voxulus-border");
                }, 3000);
              }
              if (node === document.activeElement) {
                after = true;
              }
              var children = node.children;
              for (var i = 0; i < children.length; i++) deepFirstSearch(children[i]);
            }
          }
          deepFirstSearch(document);
        }, []);
      },
    },
    WRITING: {
      stopWriting() {
        this.state = "IDLE";
      },
      startSearch() {
        this.state = "SEARCH";
        visualListeningFeedback();
      },
      async writeStuff(stuff) {
        executeScript((stuff) => document.execCommand("insertText", false, stuff), [stuff]);
      },
      async eraseStuff() {
        executeScript(() => document.execCommand("undo"));
      },
    },
    SEARCH: {
      stopWriting() {
        this.state = "IDLE";
      },
      async writeStuff(stuff) {
        window.open("http://google.com/search?q=" + stuff);
        this.state = "IDLE";
      },
    },
    SCROLL_DOWN: {
      stop() {
        clearInterval(scroll);
        this.state = "IDLE";
      },
      async scrollUp() {
        clearInterval(scroll);
        this.state = "SCROLL_UP";
        setNewInterval(-this.speed);
      },
      async faster() {
        this.speed *= 1.5;
        clearInterval(scroll);
        setNewInterval(this.speed);
      },
      async slower() {
        this.speed *= 0.5;
        clearInterval(scroll);
        setNewInterval(this.speed);
      },
    },
    SCROLL_UP: {
      stop() {
        clearInterval(scroll);
        this.state = "IDLE";
      },
      async scrollDown() {
        clearInterval(scroll);
        this.state = "SCROLL_DOWN";
        setNewInterval(this.speed);
      },
      async faster() {
        this.speed *= 1.5;
        clearInterval(scroll);
        setNewInterval(-this.speed);
      },
      async slower() {
        this.speed *= 0.5;
        clearInterval(scroll);
        setNewInterval(-this.speed);
      },
    },
  },

  dispatch(actionName, ...args) {
    const action = this.transitions[this.state][actionName];

    if (action) {
      if (actionName !== "writeStuff")
        actionName === "startSearch" || actionName === "startWriting"
          ? visualFeedback(false)
          : visualFeedback(true);
      action.call(this, ...args);
    } else {
      console.log("invalid action");
      console.log(this.state);
    }
  },
};

const voxulus = Object.create(machine);
voxulus.speed = 50;
export default voxulus;

// 0 0 0 2px rgba(138, 180, 248, .5);
