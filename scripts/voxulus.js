import { executeScript } from "./utilities.js";

let scroll;

const setNewInterval = (speed) => {
  scroll = setInterval(
    () => executeScript((s) => window.scrollBy(0, s), [speed]),
    100
  );
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
