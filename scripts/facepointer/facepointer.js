/**
 * (∩｀-´)⊃━☆ﾟ.*・｡ﾟ Facepointer
 *
 * @usage const fp = new Facepointer(config);
 */
class Facepointer {
  /**
   * @param {Object} config The config object (see README)
   */
  constructor(config = {}) {
    this.setup(config);
  }

  /**
   * Triggers an event on the document
   * @param {String} eventName The event name, appended as `facepointer-${eventName}`
   */
  emit(eventName, detail = null) {
    const event = new CustomEvent(eventName, detail);
    document.dispatchEvent(event);
  }

  /**
   * Calls a callback on `document` when an event is triggered
   * @param {String} eventName The `facepointer-${eventName}` to listen to
   * @param {Function} callback The callback to call
   */
  on(eventName, callback) {
    document.addEventListener(eventName, callback);
  }

  /**
   * Starts the tracking loop
   */
  start() {
    if (this.trackerSDK && !this.isStarted) {
      this.initSDK();
    } else if (!this.isStarted) {
      console.warn("Head tracking SDK not loaded yet");
    }
  }

  stop() {
    location.reload();
  }

  /**
   * The main tracking loop
   * - Also runs plugins
   */
  track() {
    this.head = {
      rotation: this.trackerSDK.get_rotationStabilized(),
      translation: this.trackerSDK.get_positionScale(),
      morphs: this.trackerSDK.get_morphTargetInfluencesStabilized(),
    };
    this.updatePointer();

    Object.keys(Facepointer.plugins).forEach((key) => {
      Facepointer.plugins[key](this.pointer, this);
    });

    requestAnimationFrame(() => this.track());
  }
}

/**
 * Setup static properties
 */
// Set the lib path to whereever this file is, this is required for loading dependencies correctly
Facepointer.libSrc = "./";
Facepointer.plugins = {};

// Contains the instances
Facepointer.instances = [];
window.Facepointer = Facepointer;

/**
 * Entry point to setting up this instance
 */
Facepointer.prototype.setup = function (config) {
  this.addListeners(); // @see ./Listeners.js
  this.cleanConfig(config);
  this.initProps();
  this.loadDependencies();
  this.createDebugger();
  this.createPointer();
};

/**
 * Cleans and sanitizes the config with defaults
 */
Facepointer.prototype.cleanConfig = function (config) {
  this._config = config;
  config = Object.assign(
    {
      // Whether Facepointer should automatically start after instantiation
      autostart: false,
      sensitivity: {
        // A factor to adjust the cursors move speed by
        xy: 0.7,
        // How much wider (+) or narrower (-) a smile needs to be to click
        click: 0,
      },
      stabilizer: {
        // How much stabilization to use: 0 = none, 3 = heavy
        factor: 2,
        // Number of frames to stabilizer over
        buffer: 30,
      },
      // Configs specific to plugins
      plugin: {
        click: {
          // Morphs to watch for and their required confidences
          morphs: {
            0: 0.25,
            1: 0.25,
          },
        },
        vertScroll: {
          // The multiplier to scroll by. Lower numbers are slower
          scrollSpeed: 0.15,
          // How many pixels from the the edge to scroll
          scrollZone: 100,
        },
      },
    },
    config
  );
  this.config = config;
};

/**
 * Initialize properties
 */
Facepointer.prototype.initProps = function () {
  Facepointer.instances.push(this);
  this.id = Facepointer.instances.length;
  this.trackerSDK = null;
  this.pointer = {
    x: 0,
    y: 0,
    $el: null,
    state: "",
  };
  this.tween = {
    x: -1,
    y: -1,
    rx: 0,
    ry: 0,
    positionList: [],
  };
};

let url_facepointer_js = chrome.runtime.getURL(
  "/scripts/facepointer/js/jeelizFaceTransfer.js"
);
let url_facepointer_json = chrome.runtime.getURL(
  "/scripts/facepointer/js/jeelizFaceTransferNNC.json"
);

/**
 * Load the Weboji head tracker
 */
Facepointer.prototype.loadDependencies = function () {
  if (!this.trackerSDK) {
    const $script = document.createElement("script");
    $script.async = true;
    $script.onload = () => {
      document.body.classList.remove("facepointer-loading");
      this.emit("dependenciesReady");
    };

    $script.src = url_facepointer_js;

    document.getElementsByTagName("head")[0].appendChild($script);
    document.body.classList.add("facepointer-loading");
  } else {
    this.emit("dependenciesReady");
  }
};

/**
 * Creates the debugger, which contains the canvas/video element
 */
Facepointer.prototype.createDebugger = function () {
  const $wrap = document.createElement("DIV");
  $wrap.classList.add("facepointer-debugger");

  const $canvas = document.createElement("CANVAS");
  $canvas.classList.add("facepointer-canvas");
  $canvas.setAttribute("id", `facepointer-canvas-${this.id}`);
  $canvas.style.display = "none";
  $wrap.appendChild($canvas);

  document.body.appendChild($wrap);
};

/**
 * Creates the cursor/pointer
 */
Facepointer.prototype.createPointer = function () {
  const $pointer = document.createElement("DIV");
  $pointer.classList.add("facepointer-pointer");
  this.pointer.$el = $pointer;

  document.body.appendChild($pointer);
};

/**
 * Initializes the head tracker SDK
 */
Facepointer.prototype.initSDK = function () {
  const url = url_facepointer_json;
  document.body.classList.add("facepointer-loading");
  fetch(url)
    .then((model) => {
      return model.json();
    })
    // Next, let's initialize the head tracker API
    .then((model) => {
      this.trackerHelper.size_canvas({
        canvasId: `facepointer-canvas-${this.id}`,
        callback: (videoSettings) => {
          this.trackerSDK.init({
            canvasId: `facepointer-canvas-${this.id}`,
            NNCpath: JSON.stringify(model),
            videoSettings,
            callbackReady: () => {
              document.body.classList.remove("facepointer-loading");
              document.body.classList.add("facepointer-started");
              this.isStarted = true;
              this.track();
            },
          });
        },
      });
    })
    .catch(() => console.error(`Couldn't load head tracking model at ${url}`));
};

/**
 * Updates the pointer's position given it's head pose
 */
Facepointer.prototype.updatePointer = function () {
  // Calculate X/Y
  let rx = (this.head.rotation[0] * 180) / Math.PI; // vertical [0;30]
  let ry = (this.head.rotation[1] * 180) / Math.PI; // horizontal [-40;40]
  // console.log("x = " + rx + " ; y = " + ry)
  // Compensation for edge cases
  rx -= 15;
  // rx = rx + 1 - 4 * (Math.abs(ry) / 45)

  // Clip
  const rxMax = 12;
  const ryMax = 30;
  if (ry < -ryMax) ry = -ryMax;
  if (ry > ryMax) ry = ryMax;
  if (rx < -rxMax) rx = -rxMax;
  if (rx > rxMax) rx = rxMax;

  // console.log("rx = " + rx + " ; ry = " + ry)

  // Remove some jittering by tweening the rotations values using TweenMax.
  // We could do it without TweenMax: 0.15 seconds is 15% of 1 second, so it tween over 4,5 frames (30 fps)
  // but TweenMax is so convenient for that purpose.
  let tweenFace = this.tween; // our helper for this face index

  // Stabilizer
  const stabilizer = [
    { jitter: 0, tween: 0 },
    { jitter: 0.5, tween: 0.25 },
    { jitter: 5, tween: 1.5 },
    { jitter: 10, tween: 3 },
  ];
  // Number of degrees needed to change before forcing a position (vs tweening it eg stabilizing it)
  const jitterFactor = stabilizer[this.config.stabilizer.factor].jitter;
  // How long to tween while stabilizing. Higher = slower, lower = faster
  let tweenDuration = stabilizer[this.config.stabilizer.factor].tween;
  if (Math.abs(tweenFace.rx - rx) > jitterFactor) {
    tweenDuration = 0.0;
  }
  if (Math.abs(tweenFace.ry - ry) > jitterFactor) {
    tweenDuration = 0.0;
  }

  TweenMax.to(tweenFace, tweenDuration, {
    rx,
    ry,
    overwrite: true,
    ease: "Linear.easeNone",
  });

  // ryp and rxp are between -1.0 to 1.0 with slower movements on the edges due to Math.sin
  // Center of screen is (screen.width * 0.5), so eg. 0.5 + 1.0 would be too much over the edge
  let ryp = Math.sin((tweenFace.ry / ryMax) * (Math.PI * 0.5));
  let rxp = Math.sin((tweenFace.rx / rxMax) * (Math.PI * 0.5));

  // Let's reduce the values by 40% to go only 10% over the edge...
  // ryp *= 0.60
  // rxp *= 0.60
  ryp *= this.config.sensitivity.x;
  rxp *= this.config.sensitivity.y;

  let _x = window.innerWidth * (ryp + 0.5);
  let _y = window.innerHeight * (rxp + 0.5);

  // let _x = window.innerWidth * 0.98;
  // let _y = window.innerHeight * 0.98;
  // let _y = window.outerHeight * rxp + window.outerHeight / 4;

  // So at this stage it's a bit less jittering, but to improve the overall placement when the face stands
  // still, let's average out the position over 1 second (30 frames). This will lead to a bit of delay when
  // moving the head fast, but it will greatly improve slow movements.
  if (tweenFace.positionList.length < this.config.stabilizer.buffer) {
    // add helper objects until the array is full
    tweenFace.positionList.push({ x: _x, y: _y });

    // leave the cursor in the center to get rid
    // of the annoying jumping at start up.
    tweenFace.x = window.innerWidth * 0.5;
    tweenFace.y = window.innerHeight * 0.5;
  } else {
    const position = tweenFace.positionList.shift();
    position.x = _x;
    position.y = _y;

    tweenFace.positionList.push(position);

    const numPositions = tweenFace.positionList.length;
    let avgX = 0;
    let avgY = 0;

    for (let n = 0; n < numPositions; n++) {
      avgX += tweenFace.positionList[n].x;
      avgY += tweenFace.positionList[n].y;
    }

    tweenFace.x = avgX / numPositions;
    tweenFace.y = avgY / numPositions;
  }

  this.pointer.$el.style.left = `${tweenFace.x}px`;
  this.pointer.$el.style.top = `${tweenFace.y}px`;

  (this.pointer.x = tweenFace.x), (this.pointer.y = tweenFace.y);
};

/**
 * Add event listeners
 */
Facepointer.prototype.addListeners = function () {
  // Maybe autostart
  this.on("dependenciesReady", () => {
    this.trackerSDK = window.JEEFACETRANSFERAPI;
    this.trackerHelper = window.JEELIZ_RESIZER;
    this.config.autostart && this.start();
  });
};
(function () {
  /**
   * Listen to clicks on .facepointer-start and .facepointer-stop
   * - Instantiates a Facepointer if it doesn't exist with autostart...
   * - ...or Starts the last created Facepointer
   */
  document.addEventListener("click", (ev) => {
    let loops = 0;
    let $el = ev.target;

    // Loop through each parent, up to 5 times
    while (loops++ < 5) {
      // .facepointer-start
      if ($el.classList.contains("facepointer-start")) {
        if (Facepointer.instances.length) {
          Facepointer.instances[Facepointer.instances.length - 1].start();
        } else {
          new Facepointer({ autostart: true });
        }
        break;
      }

      // .facepointer-stop
      if ($el.classList.contains("facepointer-stop")) {
        location.reload();
        break;
      }

      if ($el.parentElement) $el = $el.parentElement;
      else break;
    }
  });
})();

let config = {
  // Whether Facepointer should automatically start after instantiation
  autostart: true,

  sensitivity: {
    // A factor to adjust the cursors move speed by
    x: 0.5,
    y: 0.5,
    // How much wider (+) or narrower (-) a smile needs to be to click
    click: 0,
  },

  stabilizer: {
    // How much stabilization to use: 0 = none, 3 = heavy
    factor: 3,
    // Number of frames to stabilizer over
    buffer: 30,
  },
};

const fp = new Facepointer(config);

console.log(fp);
console.log("We have facepointer!");

let clickableElements = null;

Object.defineProperty(Element.prototype, "documentOffsetTop", {
  get: function () {
    return (
      this.offsetTop +
      (this.offsetParent ? this.offsetParent.documentOffsetTop : 0)
    );
  },
});

Object.defineProperty(Element.prototype, "documentOffsetLeft", {
  get: function () {
    return (
      this.offsetLeft +
      (this.offsetParent ? this.offsetParent.documentOffsetLeft : 0)
    );
  },
});

function isClickable(node) {
  return (
    node.getAttribute("type") === "submit" ||
    node.getAttribute("role") === "button" ||
    node.getAttribute("role") === "option" ||
    node.tagName === "BUTTON" ||
    node.tagName === "A" ||
    node.tagName === "INPUT" ||
    node.tagName === "TEXTAREA"
  );
}

function getClickableElements(documentChildren) {
  let clickables = [];
  let nodes = [...documentChildren];
  let counter = 0;
  while (nodes && counter < 5000) {
    counter++;
    node = nodes.shift();
    if (node) {
      if (isClickable(node)) {
        clickables.push(node);
        //node.style.border = "2px solid blue";
      }
      var children = node.children;
      for (var i = 0; i < children.length; i++) nodes.push(children[i]);
    }
  }
  clickableElements = clickables;
}

function distanceBetween(element1, element2) {
  return (
    (element2.documentOffsetLeft - element1.x) ** 2 +
    (element2.documentOffsetTop - element1.y) ** 2
  );
}

function getClosestElement(position, elements) {
  console.log(position);
  let closestElement = null;
  let closestDistance = Number.MAX_SAFE_INTEGER;

  elements.forEach((element) => {
    let distance = distanceBetween(position, element);
    if (distance < closestDistance) {
      closestElement = element;
      closestDistance = distance;
    }
  });

  console.log(closestElement);
  console.log({
    documentOffsetLeft: closestElement.documentOffsetLeft,
    documentOffsetTop: closestElement.documentOffsetTop,
  });
  return closestElement;
}

let closestElements = [];
let maxClosestElements = 10;

function mostDistantClosestElementIndex(closestElements) {
  let longestDistance = Number.MIN_SAFE_INTEGER;

  let index = 0;
  for (let i = 0; i < closestElements.length; i++) {
    let element = closestElements[i];
    if (element.distance > longestDistance) {
      longestDistance = element.distance;
      index = i;
    }
  }
  return { index, distance: longestDistance };
}

function getClosestElements(position, elements) {
  elements.forEach((element) => {
    let distance = distanceBetween(position, element);

    if (closestElements.length < maxClosestElements)
      closestElements.push({ element, distance });
    else {
      let mostDistantClosestElement =
        mostDistantClosestElementIndex(closestElements);
      if (distance < mostDistantClosestElement.distance) {
        closestElements[mostDistantClosestElement.index] = {
          element,
          distance,
        };
      }
    }
  });
}

function highlightElement(element, color) {
  element.style.border = none;
}

function highlightElement(element, color) {
  element.style.border = `2px solid ${color}`;
}

setInterval(getClickableElements, 5000, document.children);

let selectedElement = null;

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === "click") {
    let fpX = fp.pointer.x + window.pageXOffset;
    let fpY = fp.pointer.y + window.pageYOffset;
    let element = document.elementFromPoint(fpX, fpY);
    console.log(element);
    if (element) {
      highlightElement(element, "green");
      selectedElement = element;
      getClosestElements(
        {
          x: fpX,
          y: fpY,
        },
        clickableElements
      );
      console.log(closestElements);
      closestElements.forEach((element) =>
        highlightElement(element.element, "blue")
      );
    } else {
    }
  } else if (request.type === "yes") {
    selectedElement.click();
  } else if (request.type === "next") {
    removeHighlightElement(selectedElement);
    selectedElement =
      closestElements[selectedElementIndex % maxClosestElements];
    highlightElement(selectedElement);
  }
});
