let color = "#3aa757";

setTimeout(() => {
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ audio: true }).catch(function () {
      chrome.tabs.create({
        url: chrome.extension.getURL("../html/options.html"),
        selected: true,
      });
    });
  }
}, 100);

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log("Default background color set to %cgreen", `color: ${color}`);
});
