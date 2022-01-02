const mouseCoords = { xPos: -1, yPos: -1 };

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === "mouseCoords") sendResponse(mouseCoords);
});

const handler = (e) => {
  e = e || window.event;

  var pageX = e.pageX;
  var pageY = e.pageY;

  // IE 8
  if (pageX === undefined) {
    pageX =
      e.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    pageY =
      e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  mouseCoords.xPos = pageX;
  mouseCoords.yPos = pageY;
};

document.addEventListener("mousemove", handler);
console.log("Tracking mouse moves");

let url_facepointer_js = chrome.runtime.getURL('/scripts/facepointer/js/jeelizFaceTransfer.js');
let url_facepointer_json = chrome.runtime.getURL('/scripts/facepointer/js/jeelizFaceTransferNNC.json');