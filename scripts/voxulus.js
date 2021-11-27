async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

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
        let tab = await getCurrentTab();
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.execCommand("undo"),
        });
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
        let tab = await getCurrentTab();
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (stuff) => document.execCommand("insertText", false, stuff),
          args: [stuff],
        });
      },
      async eraseStuff() {
        let tab = await getCurrentTab();
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.execCommand("undo"),
        });
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
  },
  dispatch(actionName, ...args) {
    const action = this.transitions[this.state][actionName];

    if (action) {
      action.call(this, args);
    } else {
      console.log("invalid action");
    }
  },
};

const voxulus = Object.create(machine);

export default voxulus;
