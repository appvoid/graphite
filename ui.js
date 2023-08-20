class ui {
  // Minimal UI
  // This library handles common UI related methods in a concise and minimal way
  // It also automatically handles memory management for listeners and timers

  static eventListeners = new WeakMap();

  // Events tracking
  static listen(element, type, listener, options) {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    element.addEventListener(type, listener, options);
    this.eventListeners.get(element).push({ type, listener, options });
  }

  // Events deletion
  static forget(element) {
    if (this.eventListeners.has(element)) {
      const listeners = this.eventListeners.get(element);
      for (const { type, listener, options } of listeners) {
        element.removeEventListener(type, listener, options);
      }
      this.eventListeners.delete(element);
    }
  }

  // Creates an element with optional classes, styles, and text
  static create(tagName, options = {}) {
    const { classes, styles, text } = options;
    const element = document.createElement(tagName);

    if (classes) {
      element.classList.add(...classes);
    }

    if (styles) {
      Object.assign(element.style, styles);
    }

    if (text) {
      element.innerText = text;
    }
    document.body.append(element);
    return element;
  }

  // Efficient element deletion
  static remove(element) {
    this.forget(element);
    element.remove();
  }

  // Efficient, human-readable time triggerer
  static wait(time, callback, unit = "secs") {
    let milliseconds;

    switch (unit) {
      case "milli":
        milliseconds = time;
        break;
      case "secs":
        milliseconds = time * 1000;
        break;
      case "mins":
        milliseconds = time * 60 * 1000;
        break;
      case "hours":
        milliseconds = time * 60 * 60 * 1000;
        break;
      default:
        throw new Error("Invalid time unit");
    }

    const timerId = setTimeout(() => {
      callback();
      clearTimeout(timerId); // Remove the timeout once it's triggered
    }, milliseconds);

    return timerId; // Return the timer ID so it can be used to clear the timeout
  }

  static start() {
    console.clear();
    this.foreground("#bbb");
    this.background("#111");
    this.selection("#555555");
    document.body.style.fontFamily = "sans-serif";
    // Getting rid context menu
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      // console.log("😑"); // I hate right click
    });
  }

  // Query a single element
  static get(selector) {
    return document.querySelector(selector);
  }

  // Query all elements matching a selector
  static all(selector) {
    return document.querySelectorAll(selector);
  }

  // Get or set innerText of an element
  static text(element, newText) {
    if (!newText) {
      return element.innerText;
    } else {
      element.innerText = newText;
    }
  }

  // Get or set HTML of an element
  static html(element, newHTML) {
    if (!newHTML) {
      return element.innerHTML;
    } else {
      element.innerHTML = newHTML;
    }
  }

  // Log a message with an optional clear option
  static log(msg, clear = false) {
    if (clear) console.clear();
    console.log(msg);
  }

  // Logs a message to screen
  static popup(message = "This is a notification.", options = {}) {
    let _this = this // global access to the main module
    const {
      position = "center", // Default position
      backgroundColor = "#222", // Default background color
      textColor = "white", // Default text color
      borderColor = "#333", // Default border color
      displayTime = 4, // Default display time in seconds
    } = options;

    const style = document.createElement("style");

    const popup = document.createElement("div");
    popup.id = "popup";
    popup.style.position = "fixed";
    popup.style.top = position === "top" ? "8%" : "50%"; // Adjust top position based on 'position' option
    popup.style.left = "50%";
    popup.style.width = "16vw";
    popup.style.borderRadius = "0.75rem";
    popup.style.padding = "1rem";
    popup.style.color = textColor;
    popup.style.backgroundColor = backgroundColor;
    popup.style.border = `3px solid ${borderColor}`;
    popup.style.transition = "transform 0.2s ease-out";
    popup.style.transform = "translate(-50%, -50%) translateY(16px)";
    popup.style.display = "none";

    document.body.appendChild(popup);

    function togglePopUp(msg = message) {
      popup.innerText = msg;

      if (popup.style.display === "none") {
        popup.style.display = "block";
        popup.style.transform = "translate(-50%, -50%) translateY(0)";
        // we use "_this" because the "this" is a reference for function togglePopUp
        _this.wait(4, () => { 
          popup.style.display = "none";
          popup.style.transform = "translate(-50%, -50%) translateY(16px)";
        });
      }
    }

    return togglePopUp();
  }

  
   static shortcut(keyCombo, callback) {
    const keys = keyCombo.toLowerCase().split('+').map(key => key.trim());
    
    document.addEventListener('keydown', (event) => {
      const pressedKeys = keys.map(key => {
        if (key === 'ctrl') {
          return event.ctrlKey;
        } else if (key === 'shift') {
          return event.shiftKey;
        } else if (key === 'alt') {
          return event.altKey;
        } else {
          return event.key.toLowerCase() === key;
        }
      });
      
      if (pressedKeys.every(key => key)) {
        callback(event);
      }
    });
  }
  
  static shortcut(keyCombo, callback) {
    document.onkeyup = function (e) {
      const keys = keyCombo.toLowerCase().split('+').map(key => key.trim());

      const pressedKeys = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        key: e.key.toLowerCase()
      };

      const allKeysPressed = keys.every(key => {
        if (key === 'ctrl') {
          return pressedKeys.ctrl;
        } else if (key === 'alt') {
          return pressedKeys.alt;
        } else if (key === 'shift') {
          return pressedKeys.shift;
        } else {
          return pressedKeys.key === key;
        }
      });

      if (allKeysPressed) {
        callback(e);
      }
    };
  }
  
  // Styles
  static convert6DigitsHexToColorWithOpacity(hexColor, opacity) {
    // Extend shorthand hex to full hex
    const fullHexColor =
      hexColor.length === 3 ? hexColor.replace(/./g, "$&$&") : hexColor;

    // Parse hex values
    const red = parseInt(fullHexColor.slice(1, 3), 16);
    const green = parseInt(fullHexColor.slice(3, 5), 16);
    const blue = parseInt(fullHexColor.slice(5, 7), 16);

    // Create RGBA string
    const rgbaColor = `rgba(${red}, ${green}, ${blue}, ${opacity})`;

    return rgbaColor;
  }

  static selection(background, color = "white", opacity = 0.33) {
    // selection only supports six-digits rgb values like: #345235 or #381226
    const style = `
    ::selection {
      background-color: ${this.convert6DigitsHexToColorWithOpacity(
        background,
        opacity
      )};
      color: ${color};
    }
  `;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = style;
    document.head.appendChild(styleElement);
  }

  static foreground(value) {
    document.body.style.color = value;
  }

  static background(value) {
    document.body.style.background = value;
  }

  static font(value) {
    document.body.style.fontFamily = value;
  }

  static size(element, value) {
    element.style.fontSize = value;
  }

  static pointer(element) {
    element.style.cursor = "pointer";
  }

  static select(element, select = true) {
    if (select === true) {
      element.style.userSelect = "text";
    } else {
      element.style.userSelect = "none";
    }
  }

  static padding(element, value) {
    element.style.padding = value;
  }

  static radius(element, value) {
    element.style.borderRadius = value;
  }

  static color(
    element,
    startColor,
    endColor = null,
    useFontGradient = false,
    angle = "to bottom",
    radial = false,
    radialShape = "circle",
    radialPosition = "center"
  ) {
    let gradient;

    if (radial) {
      gradient = `radial-gradient(${radialShape} ${radialPosition}, ${startColor}, ${endColor})`;
    } else {
      gradient = `linear-gradient(${angle}, ${startColor}, ${endColor})`;
    }

    if (useFontGradient) {
      if (endColor === null) {
        // we first check if we want a solid color
        element.style.color = startColor;
      } else {
        element.style.backgroundImage = gradient;
        element.style.webkitBackgroundClip = "text";
        element.style.webkitTextFillColor = "transparent";
      }
    } else {
      if (endColor === null) {
        // we first check if we want a solid color
        element.style.backgroundColor = startColor;
      } else {
        element.style.background = gradient;
      }
    }
    const finalColor = gradient;
    return finalColor;
  }

  // Run a callback when the DOM is fully loaded
  static loaded(callback) {
    if (document.readyState === "loading") {
      this.listen(document, "DOMContentLoaded", callback);
    } else {
      callback();
    }
  }
}
