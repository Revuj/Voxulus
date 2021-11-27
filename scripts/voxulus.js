import { executeScript } from "./utilities.js";

let scroll;

const machine = {
  state: "IDLE",
  speed: 50,
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
        scroll = setInterval(
          () => executeScript(() => window.scrollBy(0, 50)),
          100
        );
      },
      async scrollUp() {
        this.state = "SCROLL_UP";
        scroll = setInterval(
          () => executeScript(() => window.scrollBy(0, -50)),
          100
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
        scroll = setInterval(
          () => executeScript(() => window.scrollBy(0, -50)),
          100
        );
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
        scroll = setInterval(
          () => executeScript(() => window.scrollBy(0, 50)),
          100
        );
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

export default voxulus;
