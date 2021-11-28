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

async function sendMessage(msg, callback) {
  let tab = await getCurrentTab();
  chrome.tabs.sendMessage(tab.id, msg, (response) => callback(response));
}

export { getCurrentTab, executeScript, sendMessage };
