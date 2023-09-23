class ui {
  // This library handles common UI related methods in a "concise" and minimal way
  // This library highly focuses on User Experience and minimal code
  static doc = document;
  static body = document.body;

  static gradients = {
    modern: { start: "#7c6", end: "#48e" },
    insta: { start: "#49f", end: "#a13" },
    wavy: { start: "#FFBCF0", end: "#AAA5FF" }
    // Add more color keywords here
  };

  // Todo:
  // Custom splash screen
  // About page or frame
  // Intervals handler
  // Clocks with interval handlers
  // Fix/workaround for drag+animate | Done
  // .animate fix workaround          | Done
  // "push" animation for .pointer
  // Icons grid with custom columns/rows number

  // Changelog
  // Optional parameter to include id for .create() method
  // Fixed coordinates , now we have perfect dragging
  // Fixed first-time tracking position for .drag() method, this prevents initial jumps to 0,0 coordinate
  // Drag 'n Drop and animations can now work together!
  // Drag 'n Drop supports touchscreens
  // New color gradients and .graphite() theme method for elements
  // Context Menu support

  static eventListeners = new WeakMap();
  static clockIntervals = new WeakMap();

  static isOnline() {
    return navigator.onLine;
  }

  static internet(firstTime=false) {
    if (firstTime === true){
      // Check initial online status
      if (navigator.onLine) {
        this.popup('Connected to the internet.');
      } else {
        this.popup('Lost internet connection.');
      }
    }
    // Then listen for changes
    window.addEventListener('online', () => {
      this.popup('Connected to the internet.');
    });
  
    window.addEventListener('offline', () => {
      this.popup('Lost internet connection.');
    });
  }
  

  static title(msg) {
    document.title = msg;
  }

  // Log a message with an optional clear option
  static log(msg, clear = false) {
    if (clear) console.clear();
    console.log(msg);
  }

  // Events tracking
  static listen(element, type, listener, options) {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }

    const wrappedListener = function (event) {
      if (type === "contextmenu") {
        event.preventDefault();
      }
      listener(event);
    };

    element.addEventListener(type, wrappedListener, options);
    this.eventListeners.get(element).push({ type, wrappedListener, options });
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
    const { classes, styles, text, id, placeholder } = options;
    const element = document.createElement(tagName);

    if (id) {
      element.setAttribute("id", id);
    }

    if (classes) {
      element.classList.add(...classes);
    }

    if (styles) {
      Object.assign(element.style, styles);
    }

    if (text) {
      element.innerHTML = this.parseMarkdown(text);
    }

    if (placeholder) {
      element.placeholder = placeholder;
    }

    document.body.append(element);
    return element;
  }

  static parseMarkdown(text) {
    let parsedText = text;

    // Parse headers: # Header1, ## Header2, ### Header3
    parsedText = parsedText.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    parsedText = parsedText.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    parsedText = parsedText.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Parse links: [text](url)
    parsedText = parsedText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a target="_blank" href="$2">$1</a>'
    );

    // Parse bullets: * item
    parsedText = parsedText.replace(/^\s*\* (.+)$/gm, "<li>$1</li>");
    parsedText = parsedText.replace(/<li>.*<\/li>/g, "<ul>$&</ul>");

    // Parse ordered list: 1. item
    parsedText = parsedText.replace(/^\s*\d+\. (.+)$/gm, "<li>$1</li>");
    parsedText = parsedText.replace(/<li>.*<\/li>/g, "<ol>$&</ol>");

    // Parse bold text: **text**
    parsedText = parsedText.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Parse italic text: *text* or _text_
    parsedText = parsedText.replace(
      /(^|[^*])\*([^*]+)\*([^*]|$)/g,
      "$1<em>$2</em>$3"
    );
    parsedText = parsedText.replace(
      /(^|[^_])_([^_]+)_([^_]|$)/g,
      "$1<em>$2</em>$3"
    );

    // Parse code blocks: `code`
    parsedText = parsedText.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Parse blockquotes: > quote
    parsedText = parsedText.replace(
      /^> (.+)$/gm,
      "<blockquote>$1</blockquote>"
    );

    return parsedText;
  }

  // Efficient element deletion
  static remove(element) {
    if (element) {
      this.forget(element); // Clears timers
      element.remove();
      element = null; // Clears references to ensure no memory leaks are left
    } else {
      this.log("Tried to remove element that doesn't exist");
    }
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

  // Create a real-time clock and display it in the specified element
  static clock(element, { debug = false, clear = true, seconds = false } = {}) {
    function updateClock() {
      function checkTime(i) {
        return i < 10 ? "0" + i : i;
      }

      // Check if the element still exists in the DOM
      if (!document.contains(element)) {
        clearInterval(intervalId);
        return;
      }

      const today = new Date();
      const h = checkTime(today.getHours());
      const m = checkTime(today.getMinutes());
      const s = checkTime(today.getSeconds());

      let time;

      if (seconds) {
        time = `${h}:${m}:${s}`;
      } else {
        time = `${h}:${m}`;
      }

      if (debug) {
        ui.log(time, clear);
      }
      element.innerText = time;
    }

    updateClock(); // Initial update

    // Set up an interval to update the clock every second
    const intervalId = setInterval(updateClock, 1000);

    // Automatically clear the interval when the element is removed
    ui.listen(element, "beforeRemove", () => {
      clearInterval(intervalId);
    });

    return element; // Return the element for convenience
  }

  // Animate element properties using transitions
  static animate(
    element,
    properties,
    duration = 500,
    easing = "ease-in-out",
    lerpFunction = null
  ) {
    const initialStyles = {};

    // Store the initial styles of the animated properties
    for (const property in properties) {
      initialStyles[property] = getComputedStyle(element)[property];
    }

    // Apply the initial styles immediately to ensure smooth animation start
    element.style.transition = "none";
    Object.assign(element.style, initialStyles);
    element.style.position = "fixed"; // Without these, drag function won't work correctly

    // Calculate start time
    const startTime = performance.now();

    // Define the animation frame function
    function animateFrame(timestamp) {
      const elapsedTime = timestamp - startTime;

      if (elapsedTime < duration) {
        // Calculate progress based on easing function
        let progress = elapsedTime / duration;
        if (easing === "linear") {
          // Linear easing (default)
        } else if (easing === "ease-in") {
          progress = Math.pow(progress, 2);
        } else if (easing === "ease-out") {
          progress = 1 - Math.pow(1 - progress, 2);
        } else if (easing === "ease-in-out") {
          progress = 0.5 - 0.5 * Math.cos(Math.PI * progress);
        }

        // Apply interpolated styles for each property
        for (const property in properties) {
          const initialValue = parseFloat(initialStyles[property]);
          const targetValue = parseFloat(properties[property]);
          const interpolatedValue =
            initialValue + (targetValue - initialValue) * progress;
          element.style[property] = interpolatedValue + "px";
        }

        // Continue animation
        requestAnimationFrame(animateFrame);
      } else {
        // Animation finished, reset styles and clear transition
        element.style.transition = "";
        element.style.position = "fixed";
        element.style.zIndex = "auto";
      }
    }

    // Start the animation frame loop
    requestAnimationFrame(animateFrame);
  }

  // Query a single element
  static get(selector) {
    return document.querySelector(selector);
  }

  // Query all elements matching a selector
  static all(selector) {
    return document.querySelectorAll(selector);
  }

  // Get or set innerText of an element with optional markdown support
  static text(element, newText, isMarkdown = false) {
    if (!newText) {
      return element.innerText;
    } else {
      if (isMarkdown) {
        element.innerHTML = this.parseMarkdown(newText);
      } else {
        element.innerText = newText;
      }
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

  static drag(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.style.cursor = "pointer";

    // Add event listeners for both mouse and touch events
    element.addEventListener("mousedown", dragStart);
    element.addEventListener("touchstart", dragStart);
    document.addEventListener("touchmove", updatePosition); // Listen for touchmove globally

    function dragStart(e) {
      e.preventDefault();
      isDragging = true;

      if (e.type === "mousedown") {
        // For mouse events
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
      } else if (e.type === "touchstart") {
        // For touch events
        const touch = e.touches[0];
        offsetX = touch.clientX - element.getBoundingClientRect().left;
        offsetY = touch.clientY - element.getBoundingClientRect().top;
      }

      // Set the element's position to "fixed" so it doesn't affect other elements
      element.style.position = "fixed";
      element.style.zIndex = "9999";
      element.style.userSelect = "none";

      // Update the element's position initially
      updatePosition(e);

      // Add event listeners for dragging and dropping
      document.addEventListener("mousemove", updatePosition);
      document.addEventListener("mouseup", dragEnd);
      document.addEventListener("touchmove", updatePosition); // Listen for touchmove globally
      document.addEventListener("touchend", dragEnd);
    }

    function updatePosition(e) {
      if (isDragging) {
        let x, y;

        if (e.type === "mousemove") {
          // For mouse events
          x = e.clientX - offsetX;
          y = e.clientY - offsetY;
        } else if (e.type === "touchmove") {
          // For touch events
          const touch = e.touches[0];
          x = touch.clientX - offsetX;
          y = touch.clientY - offsetY;
        }

        // Update the element's position
        element.style.left = x + "px";
        element.style.top = y + "px";
        element.style.cursor = "grabbing"; // Change cursor to indicate grabbing

        // Prevent the page from scrolling while dragging
        e.preventDefault();
      }
    }

    function dragEnd() {
      isDragging = false;

      // Remove event listeners for dragging and dropping
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseup", dragEnd);
      document.removeEventListener("touchmove", updatePosition); // Remove touchmove listener
      document.removeEventListener("touchend", dragEnd);

      element.style.position = "fixed";
      element.style.zIndex = "auto";
      element.style.cursor = "pointer";
    }
  }

  static popupCount = 0;
  static popupQueue = [];
  
  static popup(message = "This is a notification.", options = {}) {
    let _this = this;
  
    const {
      position = "center",
      backgroundColor = "rgba(29,29,29, 0.5)",
      textColor = "#FFF",
      borderColor = "#333",
      displayTime = 3000
    } = options;
  
    let popup = document.createElement("div");
    popup.id = `popup-${this.popupCount}`;
    popup.style.zIndex = "10";
    popup.style.position = "fixed";
    popup.style.fontFamily = "sans-serif";
    popup.style.userSelect = "none";
    popup.style.transition = "all 0.2s ease-out";
    popup.style.left = "0";
    popup.style.right = "0";
    popup.style.top = "0"; 
    popup.style.transform = `translateY(${(this.popupQueue.length * 1)}rem)`;
    popup.style.margin = "auto";
    popup.style.marginTop = "1.5rem";
    popup.style.width = "32vw";
    popup.style.minWidth = "196px";
    popup.style.maxWidth = "256px";
    popup.style.borderRadius = "0.75rem";
    popup.style.padding = "1rem";
    popup.style.color = textColor;
    popup.style.backdropFilter = "blur(1rem)";
    popup.style.backgroundColor = backgroundColor;
    popup.style.border = `3px solid ${borderColor}`;
    popup.style.boxShadow = "0px 16px 16px rgba(0, 0, 0, 0.1)";
  
    // If there are already 1 popups, remove the oldest one
    if (this.popupQueue.length === 1) {
      const oldestPopup = this.popupQueue.shift();
      oldestPopup.style.transition = "all 0.2s ease-in";
      oldestPopup.style.opacity = "0";
      oldestPopup.style.transform = `translateY(${parseInt(oldestPopup.style.transform.match(/\d+/)) - 1}rem)`;
  
      setTimeout(() => {
        document.body.removeChild(oldestPopup);
      }, 200);
  
      // Adjust the position of the remaining popups
      this.popupQueue.forEach((p, index) => {
        p.style.transform = `translateY(${(index * 2)}rem)`;
      });
  
      this.popupCount--;
    }
  
    setTimeout(() => {
      popup.style.transform = `translateY(${(this.popupQueue.length * 2)}rem)`;
    }, 10);
  
    document.body.appendChild(popup);
    this.popupQueue.push(popup); // Add new popup to the queue
  
    // Increase popup count when a new popup is displayed
    this.popupCount++;
  
    function togglePopup(msg = message) {
      popup.innerHTML = msg;
  
      setTimeout(() => {
        popup.style.transition = "all 0.2s ease-in";
        popup.style.opacity = "0";
  
        setTimeout(() => {
          document.body.removeChild(popup);
          _this.popupQueue = _this.popupQueue.filter(p => p !== popup); // Remove popup from the queue
          popup = null;
  
          // Decrease popup count when a popup is removed
          _this.popupCount--;
  
          // Adjust the position of the remaining popups
          _this.popupQueue.forEach((p, index) => {
            p.style.transform = `translateY(${(index * 2)}rem)`;
          });
        }, 200);
      }, displayTime);
      return popup
    }
  
    return togglePopup();
  }
  

  static shortcut(keyCombo, callback) {
    let isCallbackTriggered = false; // in order to make sure it makes a callback just once per trigger
  
    const keys = keyCombo
      .toLowerCase()
      .split("+")
      .map((key) => key.trim());
  
    document.addEventListener("keydown", (event) => {
      if (isCallbackTriggered) return;
  
      const pressedKeys = keys.map((key) => {
        if (key === "ctrl") {
          return event.ctrlKey;
        } else if (key === "shift") {
          return event.shiftKey;
        } else if (key === "alt") {
          return event.altKey;
        } else {
          return event.key.toLowerCase() === key;
        }
      });
  
      if (pressedKeys.every((key) => key)) {
        isCallbackTriggered = true;
        callback(event);
      }
    });
  
    document.addEventListener("keyup", () => {
      isCallbackTriggered = false;
    });
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
    document.body.style.transition =
      "background 0.15s ease-in-out, color 0.1s ease-in-out";
  }

  static background(value) {
    document.body.style.background = value;
    document.body.style.transition =
      "background 0.15s ease-in-out, color 0.1s ease-in-out";
  }

  static font(value) {
    document.body.style.fontFamily = value;
  }

  static size(element, value) {
    element.style.fontSize = value;
  }

  static pointer(element) {
    // usually when we point something up we don't want to select text so
    element.style.userSelect = "none";
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

  static stream = null;

  static async getStream() {
    if (!this.stream) {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    }
    return this.stream;
  }

  static async cam(type = "pic", options = {}, element = document.body) {
    try {
      const stream = await this.getStream();

      const {
        aspectRatio = 1, // Default to 1:1
        radius = 0 // Default to 0 (no border radius)
      } = options;

      if (type === "video") {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
        mediaRecorder.start();

        // Stop recording after 5 seconds (or any desired duration)
        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const videoUrl = URL.createObjectURL(blob);

          const videoElement = document.createElement("video");
          videoElement.src = videoUrl;
          videoElement.controls = true;
          element.appendChild(videoElement);
        };
      } else if (type === "pic") {
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.play();

        await new Promise((resolve) => {
          videoElement.onloadedmetadata = resolve;
        });

        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        let size,
          offsetX = 0,
          offsetY = 0;
        if (aspectRatio === 1) {
          size = Math.min(videoWidth, videoHeight);
          offsetX = (videoWidth - size) / 2;
          offsetY = (videoHeight - size) / 2;
        } else {
          size = Math.min(videoWidth, videoHeight);
        }

        const canvas = document.createElement("canvas");
        canvas.width = aspectRatio === 1 ? size : videoWidth;
        canvas.height = aspectRatio === 1 ? size : videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(
          videoElement,
          offsetX,
          offsetY,
          videoWidth - 2 * offsetX,
          videoHeight - 2 * offsetY,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const imageUrl = canvas.toDataURL("image/png");

        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.style.borderRadius = `${radius}px`;
        element.appendChild(imgElement);

        return imageUrl;
      }
    } catch (error) {
      console.error("Error accessing camera or taking picture:", error);
      throw error;
    }
  }

  static hover(element) {
    element.style.position = "relative";
    element.style.cursor = "pointer";
    element.style.transition = "transform 0.1s";

    const beforeElement = document.createElement("div");
    beforeElement.style.position = "absolute";
    beforeElement.style.top = "0";
    beforeElement.style.left = "0";
    beforeElement.style.width = "100%";
    beforeElement.style.height = "100%";
    beforeElement.style.borderRadius = "inherit";
    beforeElement.style.opacity = "0";
    beforeElement.style.transition = "opacity 500ms";
    beforeElement.style.zIndex = "3";
    beforeElement.style.background =
      "radial-gradient(320px circle, rgba(255, 255, 255, 0.03), transparent 10%)";
    element.appendChild(beforeElement);

    const afterElement = document.createElement("div");
    afterElement.style.position = "absolute";
    afterElement.style.top = "0";
    afterElement.style.left = "0";
    afterElement.style.width = "100%";
    afterElement.style.height = "100%";
    afterElement.style.borderRadius = "inherit";
    afterElement.style.opacity = "0";
    afterElement.style.transition = "opacity 500ms";
    afterElement.style.zIndex = "1";
    afterElement.style.background =
      "radial-gradient(600px circle, rgba(255, 255, 255, 0.4), transparent 10%)";
    element.appendChild(afterElement);

    this.listen(element, "mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      beforeElement.style.background = `radial-gradient(320px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.03), transparent 33%)`;
      afterElement.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.1), transparent 33%)`;
      beforeElement.style.opacity = "1";
      afterElement.style.opacity = "1";
    });

    this.listen(element, "mouseleave", () => {
      beforeElement.style.opacity = "0";
      afterElement.style.opacity = "0";
    });

    this.listen(element, "mousedown", () => {
      element.style.transform = "scale(0.96)";
      element.style.filter = "brightness(1.1)";
    });

    this.listen(element, "mouseup", () => {
      element.style.transform = "scale(1)";
      element.style.filter = "brightness(1)";
    });
  }

  static button(text, callback) {
    const element = this.create("button");
    if (callback) this.listen(element, "click", callback);

    element.innerText = text;
    this.pointer(element);

    element.style.transition = ".07s all ease-in-out";
    element.style.color = "white";
    element.style.outline = "none";
    element.style.border = "solid 3px rgba(66, 66, 66, 0.5)";
    element.style.borderRadius = ".75rem";
    element.style.padding = "1rem";
    element.style.margin = "16px";
    element.style.backdropFilter = "blur(1.5rem)";
    element.style.backgroundColor = "rgba(44, 44, 44, 0.8)";

    // Add event listeners for interactivity
    element.addEventListener("mouseenter", () => {
      // Add hover effect
      element.style.transform = "scale(1.04)";
    });

    element.addEventListener("mouseleave", () => {
      // Remove hover effect
      element.style.transform = "scale(1)";
    });

    element.addEventListener("mousedown", () => {
      // Apply the :active styles
      element.style.transform = "scale(0.95)";
      element.style.filter = "brightness(0.9)";
    });

    element.addEventListener("mouseup", () => {
      // Revert to normal state after mouseup
      element.style.transform = "scale(1)";
      element.style.filter = "brightness(1)";
    });

    return element;
  }

  static elastic(element, duration = 4000, direction = 'bottom', intensity = 1, velocity = 1, startPoint = 'top', endPoint = 'center', percentageOfScreen = 0.2) {
    let dotValue = 0;
    const frameRate = 60; // assuming 60fps
    const totalFrames = duration / (1000 / frameRate);
    const speed = 1 / totalFrames;

    const positions = {
        top: { top: '0%', left: '50%' },
        bottom: { top: '100%', left: '50%' },
        left: { top: '50%', left: '0%' },
        right: { top: '50%', left: '100%' },
        topLeft: { top: '0%', left: '0%' },
        topRight: { top: '0%', left: '100%' },
        bottomLeft: { top: '100%', left: '0%' },
        bottomRight: { top: '100%', left: '100%' }
    };

    // Apply initial styles based on the starting point
    Object.assign(element.style, positions[startPoint], {
        position: 'fixed',
        transform: 'translate(-50%, -50%)',
    });

    function run() {
        const progression = (Math.pow(2, -10 * dotValue) * Math.sin((dotValue * 10 - 0.75) * velocity) + 1);
        const movement = progression * percentageOfScreen * 100;

        switch (direction) {
            case 'right':
                element.style.left = `${parseFloat(positions[startPoint].left) + movement}%`;
                break;
            case 'left':
                element.style.left = `${parseFloat(positions[startPoint].left) - movement}%`;
                break;
            case 'top':
                element.style.top = `${parseFloat(positions[startPoint].top) - movement}%`;
                break;
            case 'bottom':
                element.style.top = `${parseFloat(positions[startPoint].top) + movement}%`;
                break;
        }

        dotValue += speed;

        if (dotValue <= 1) {
            requestAnimationFrame(run);
        }
    }

    run();
    return element
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

    if (startColor in this.gradients) {
      // Use the predefined color values if the startColor is a keyword
      const colorPair = this.gradients[startColor];
      startColor = colorPair.start;
      endColor = colorPair.end;
    }

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

  // Loops a style property of an element between two values with a specified interval
  static loop(element, property, fromValue, toValue, interval) {
    let currentValue = fromValue;
    element.style.transition = `all ${interval}s ease-in-out`; // Set the transition property
    element.style[property] = currentValue;

    const updateStyle = () => {
      currentValue = currentValue === fromValue ? toValue : fromValue;
      element.style[property] = currentValue;
    };

    const intervalId = setInterval(updateStyle, interval * 1000);

    // Store the interval ID in the WeakMap for later cleanup
    if (!this.clockIntervals.has(element)) {
      this.clockIntervals.set(element, []);
    }
    this.clockIntervals.get(element).push(intervalId);
  }

  static position(element, position) {
    // Ensure the element is positioned fixed
    element.style.position = 'fixed';
    
    // Reset previously set values to ensure the element positions correctly
    element.style.top = '';
    element.style.right = '';
    element.style.bottom = '';
    element.style.left = '';
    element.style.transform = '';
    
    if (Array.isArray(position) && position.length === 2) {
      // Set position based on array values (percentage)
      let [x, y] = position;
      if (typeof x === 'number' && typeof y === 'number' && x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        element.style.left = `${x * 100}%`;
        element.style.top = `${y * 100}%`;
        element.style.transform = 'translate(-50%, -50%)'; // to ensure the element is centered on the specified coordinates
        return element; // exit after handling array positioning
      } else {
        console.error('Invalid percentage values in the array');
        return element;
      }
    }
  
    // Switch case to handle the predefined positions
    switch (position) {
      case 'topleft':
        element.style.top = '0';
        element.style.left = '0';
        break;
      case 'top':
        element.style.top = '0';
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        break;
      case 'topright':
        element.style.top = '0';
        element.style.right = '0';
        break;
      case 'middleLeft':
        element.style.top = '50%';
        element.style.left = '0';
        element.style.transform = 'translateY(-50%)';
        break;
      case 'center':
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        break;
      case 'middleRight':
        element.style.top = '50%';
        element.style.right = '0';
        element.style.transform = 'translateY(-50%)';
        break;
      case 'bottomLeft':
        element.style.bottom = '0';
        element.style.left = '0';
        break;
      case 'bottom':
        element.style.bottom = '0';
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        break;
      case 'bottomRight':
        element.style.bottom = '0';
        element.style.right = '0';
        break;
      default:
        console.error('Invalid position value');
        break;
    }
    return element
  }

  static cmd(command) {
    document.execCommand(command);
  }

  static spin(element, velocity = 100, acceleration = 100, maxVelocity = 100) {
    // Ensure that rotation starts from 0 degrees
    let currentRotation = 0;

    // Calculate rotation step based on the given velocity and animation frame refresh rate (assume 60fps for simplicity)
    let rotationStep = velocity / 60;

    // Function to update the rotation of the element
    const updateRotation = () => {
        currentRotation += rotationStep;
        element.style.transform = `rotate(${currentRotation}deg)`;

        // Update the rotation step to simulate acceleration
        rotationStep += acceleration / 60;

        // Clamp rotationStep to ensure it doesn't exceed maxVelocity
        if (rotationStep > maxVelocity / 60) {
            rotationStep = maxVelocity / 60;
        } else if (rotationStep < -maxVelocity / 60) {
            rotationStep = -maxVelocity / 60;
        }

        // Request next animation frame
        requestAnimationFrame(updateRotation);
    };

    // Start the spinning
    updateRotation();
}



  static progress(options={label: null ,w :"128px", h : "4px", shape : "rounded", radius: "33%"}) {
    const progress_container = document.createElement("div");
    progress_container.shape = options.shape
    const progress_bar = document.createElement("div");
  
    progress_container.style.width = options.w;
    progress_container.style.margin = "1rem";
  
    if (options.shape === "rounded") { 
      const circleSize = "24px"; // Set the size of the circle here
      progress_container.style.width = circleSize;
      progress_container.style.height = circleSize;
      progress_container.style.borderRadius = options.radius;
      progress_container.style.border = "3px solid #222"; // Add border color here
      progress_container.style.background = "#222"; // Add background color here
      progress_container.style.position = "relative";
      progress_container.style.display = "flex";
      progress_container.style.alignItems = "center";
      progress_container.style.justifyContent = "center";
      progress_bar.style.position = "absolute";
      progress_bar.style.width = "100%";
      progress_bar.style.height = "100%";
      progress_bar.style.background = `conic-gradient(#444 0%, #444 0%, transparent 0%)`;
      progress_bar.style.borderRadius = options.radius;
      progress_bar.style.clipPath = "inset(0 0 0 0)"; // Adjust the clipPath to prevent cutting off

    } else {
      progress_container.style.borderRadius = "10px";
      progress_container.style.border = "3px solid #222";
  
      progress_bar.style.width = "0";
      progress_bar.style.height = options.h;
      progress_bar.style.backgroundColor = "#444";
      progress_bar.style.borderRadius = "8px";
    }
  
    progress_container.append(progress_bar);
    progress_container.bar = progress_bar;
  
    if (options.label !== null) {
      progress_container.append(
        ui.create('p', {
          text: options.label,
          styles: {
            width: "inherit",
            textAlign: "center",
            marginTop: "0.25rem",
            position: "fixed",
            fontSize: ".75rem",
            color: "#444",
            userSelect: "none",
          }
        })
      );
    }
  
    progress_container.classList.add('progress-bar');
  
    progress_container.progress = (value) => {
      if (options.shape === "rounded") {
        progress_bar.style.background = `conic-gradient(#333 0%, #333 ${value}%, transparent ${value}%)`;
      } else {
        progress_bar.style.width = value + "%";
      }
    };
    ui.body.append(progress_container);
    return progress_container;
  }
  
  

  // New method to get current mouse coordinates as a snapshot
  static mouse() {
    return { x: window.event.clientX, y: window.event.clientY };
  }

  // Context menu logic ------------------------------------------------

  static contextMenu = null;
  static menuItems = [];
  static targetElement = null;

  // Modified context method to take coordinates
  static context(coordinates, menuItems) {
    this.menuItems = menuItems;

    // Remove any existing context menu
    this.removeContextMenu();

    // Create a new context menu
    this.contextMenu = document.createElement("div");
    this.contextMenu.classList.add("ctxMenu");

    // Set the position of the context menu using the provided coordinates
    this.contextMenu.style.left = coordinates.x - 32 + "px";
    this.contextMenu.style.top = coordinates.y - 32 + "px";

    this.contextMenu.style.border = "3px solid rgba(44,44,44,0.4)";
    this.contextMenu.style.borderRadius = "16px";
    this.contextMenu.style.color = "white";
    this.contextMenu.style.width = "144px";
    this.contextMenu.style.margin = "8px";
    this.contextMenu.style.padding = "2px";
    this.contextMenu.style.backgroundColor = "rgba(44,44,44,.75)";
    this.contextMenu.style.backdropFilter = "blur(1.25rem)";
    this.contextMenu.style.position = "fixed";

    // Fade in
    this.contextMenu.style.opacity = "0";
    this.contextMenu.style.filter = "blur(2rem)";
    this.contextMenu.style.transition = "all .1s ease-in-out";
    this.contextMenu.style.transform = "translateY(128px)";

    ui.wait(0.01, () => {
      this.contextMenu.style.opacity = "1";
      this.contextMenu.style.filter = "blur(0)";
      this.contextMenu.style.transform = "translateY(0px)";
    });

    // Add the menu items HTML to the context menu
    this.contextMenu.innerHTML = this.generateMenuHTML();

    // Attach the context menu to the document
    document.body.appendChild(this.contextMenu);

    // Add click event listeners to menu items
    const menuItemsList = this.contextMenu.querySelectorAll("p");
    menuItemsList.forEach((menuItem, index) => {
      ui.listen(menuItem, "mouseenter", (e) => {
        e.target.style.backgroundColor = "rgba(80,80,80,0.25)";
      });
      ui.listen(menuItem, "mouseleave", (e) => {
        e.target.style.backgroundColor = "transparent";
      });

      menuItem.style.transition = "all .15s ease-in-out";
      menuItem.style.padding = ".5rem";
      menuItem.style.borderRadius = ".5rem";
      menuItem.style.cursor = "pointer";
      menuItem.style.userSelect = "none";
      menuItem.style.margin = ".25rem";
      menuItem.addEventListener("click", () =>
        this.handleContextMenuClick(index)
      );
    });

    // Add a click event listener to close the context menu when clicking outside
    ui.listen(document, "click", (event) => {
      this.removeContextMenu();
    });

    return this.contextMenu;
  }

  static generateMenuHTML() {
    const itemsHTML = this.menuItems
      .map(
        (item, index) =>
          `<p style="font-weight: 600; font-size: 0.88rem;" id="ctxItem-${index}">${item.label}</p>`
      )
      .join("");
    return `${itemsHTML}`;
  }

  static handleContextMenuClick(index) {
    if (index >= 0 && index < this.menuItems.length) {
      const selectedItem = this.menuItems[index];
      if (typeof selectedItem.action === "function") {
        selectedItem.action();
      }
    }

    this.removeContextMenu();
  }

  static removeContextMenu() {
    let menu = this.contextMenu;
    if (menu) {
      menu.style.opacity = "0";
      menu.style.filter = "blur(2rem)";
      menu.style.transform = "translateY(-128px)";
      ui.wait(0.1, () => {
        menu.remove();
        menu = null;
      });
    }
  }

  static dark(enabled) {
    if (enabled) {
      // Dark mode colors
      this.background("#151515");
      this.foreground("white");
    } else {
      // Light mode colors (you can customize these as needed)
      this.background("white");
      this.foreground("black");
      // Reset any other color changes for light mode
      // this.graphite(document.body); // Uncomment this if you want to reset graphite styling
    }

    // You can add more specific styling changes for dark/light mode as needed

    // Toggle the dark mode flag for future use
    this.isDark = enabled;
  }

  static fade(e, { time = 1, type = "out", fancy = false } = {}) {
    // Set the initial opacity based on the fade direction
    e.style.opacity = type === "out" ? "1" : "0";

    // If "fancy" is true, apply additional transformations
    if (fancy) {
        e.style.filter = "blur(1rem)";
        e.style.transform = "translateY(-128px)";
    }

    // Set the transition property
    e.style.transition = `all ${time}s ease-in-out`;  // Adjusted this line

    // Triggering a reflow to apply the transition
    e.offsetHeight;

    // Set the target opacity based on the fade direction
    e.style.opacity = type === "out" ? "0" : "1";

    // If fading out, remove the element after the animation completes
    if (type === "out") {
        setTimeout(() => {
            e.remove();  // Using native .remove() method
        }, time + 1000);  // Convert time to milliseconds
    }
    return e;
}



  static write(element, text, interval = 1000, human = false) {
    let index = 0;
    const length = text.length;
    let typeWriterInterval;

    function typeNextCharacter() {
      if (index < length) {
        element.textContent += text[index];
        index += 1;

        if (human) {
          clearInterval(typeWriterInterval);
          typeWriterInterval = setInterval(
            typeNextCharacter,
            interval + Math.random() * 200 - 100
          );
        }
      } else {
        clearInterval(typeWriterInterval);
      }
    }

    typeWriterInterval = setInterval(typeNextCharacter, interval);
    return element;
  }

  static style(element, property) {
    // Get the computed style of the element
    const computedStyle = window.getComputedStyle(element);
    // Get the value of a specific CSS property
    return computedStyle.getPropertyValue(property);
  }

  static graphite(elements) {
    // It supports one element or multiple elements through an array
    if (!Array.isArray(elements)) {
      // If it's not an array, convert it to a single-element array
      elements = [elements];
    }

    elements.forEach((element) => {
      // Apply Graphite styling to each element
      element.style.color = "#ccc";
      element.style.outline = "none";
      element.style.border = "solid 3px rgba(66, 66, 66, 0.5)";
      element.style.borderRadius = ".75rem";
      element.style.padding = "1rem";
      element.style.margin = "16px";
      element.style.backdropFilter = "blur(1.5rem)";
      element.style.backgroundColor = "rgba(44, 44, 44, 0.5)";
    });

    return elements.length === 1 ? elements[0] : elements;
  }
}
