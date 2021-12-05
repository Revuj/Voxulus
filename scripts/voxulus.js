import { executeScript, getMouseCoords } from "./utilities.js";

let scroll;

const setNewInterval = (speed) => {
  scroll = setInterval(
    () => executeScript((s) => window.scrollBy(0, s), [speed]),
    100
  );
};

const mouseClick = (xPos, yPos) => {
  const element = document.elementFromPoint(xPos, yPos);
  console.log(element);
  element.click();
};

const machine = {
  state: "IDLE",
  transitions: {
    IDLE: {
      startWriting() {
        this.state = "WRITING";
      },
      startSearch() {
        this.state = "SEARCH";
      },
      async eraseStuff() {
        executeScript(() => document.execCommand("undo"));
      },
      async click() {
        getMouseCoords({ type: "mouseCoords" }, (response) =>
          executeScript(mouseClick, [response.xPos, response.yPos])
        );
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
    },
    WRITING: {
      stopWriting() {
        this.state = "IDLE";
      },
      startSearch() {
        this.state = "SEARCH";
      },
      async writeStuff(stuff) {
        executeScript(
          (stuff) => document.execCommand("insertText", false, stuff),
          [stuff]
        );
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
      action.call(this, args);
    } else {
      console.log("invalid action");
      console.log(this.state);
    }
  },
};

const voxulus = Object.create(machine);
voxulus.speed = 50;
export default voxulus;
