async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function getTabByIndex(index) {
  let queryOptions = { index: index, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function executeScript(func, args) {
  let tab = await getCurrentTab();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: func,
    args: args,
  });
}

async function getMouseCoords(msg, callback) {
  let tab = await getCurrentTab();
  chrome.tabs.sendMessage(tab.id, msg, (response) => {
    if (response.xPos < 0 || response.yPos < 0) return;
    callback(response);
  });
}

async function sendClickMessage(msg) {
  let tab = await getCurrentTab();
  chrome.tabs.sendMessage(tab.id, msg, () => {});
}

export { getCurrentTab, getTabByIndex, executeScript, sendClickMessage };
