async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
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

export { getCurrentTab, executeScript, getMouseCoords };
