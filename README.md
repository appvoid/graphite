# graphite
![logo of graphite](https://raw.githubusercontent.com/appvoid/graphite/main/graphite-black.png)
## About
Graphite is an effort to make better alternatives to current frameworks using an easily customizable and minimalist design. Thought from the ground up to be easy to use for people coming from a machine learning background or artists alike. It's the main tool I'm using from now on all my javascript projects. Alpha stage but a joy to play with and modify. It's like a tiny version of JQuery but without all of the mess, just the basics to get you started quickly. You can in fact use a mix of graphite with javascript when needed or try to go all the way up with javascript and use its convenient methods when needed. This is one step forward into making myself and others able to play with javascript without all the naming and management hassle that comes with being a web developer. Just a way to make the path a little bit easier.

## Features
- [x] Minimal approach
- [x] Listeners and timers management (no need to manually free memory)
- [x] Gradient colors to backgrounds/texts directly from code
- [x] Human-readable timers
- [x] Custom made popup
- [x] Shortcuts support
- [x] localStorage Database

## Roadmap
- [ ] Interval management and human-readable set
- [ ] Realtime clock using interval management
- [ ] Add an optional argument for a pseudo animation "pushing down" feedback for the pointer method.

## Documentation

### Class ui
#### Description
The ui class provides a concise and minimal way to handle common UI-related methods and functionalities. It also automatically does memory management for event listeners and timers. This is super useful since you don't need to worry about memory leaks which is a plus for performance.

#### Properties
- eventListeners: A WeakMap that stores event listeners associated with DOM elements.
#### Methods
- #### listen(element, type, listener, options): Attach an event listener to a DOM element.
  - element (DOM element): The element to attach the listener to.
  - type (string): The type of the event to listen for (e.g., "click", "input").
  - listener (function): The function to execute when the event is triggered.
  - options (object, optional): Additional options for the event listener.

- #### forget(element): Remove all event listeners associated with a DOM element.
  - element (DOM element): The element to remove event listeners from.
  
- #### create(tagName, options): Create a new DOM element with optional classes, styles, and text.
  - tagName (string): The HTML tag name of the element to create.
  - options (object, optional):
    - classes (array of strings): CSS classes to apply to the element.
    - styles (object): Inline CSS styles to apply to the element.
    - text (string): Text content to set for the element.
  - Returns: The newly created DOM element.
      
- #### remove(element): Remove a DOM element from the document and delete associated event listeners.
    - element (DOM element): The element to remove.
  
- #### wait(time, callback, unit = "secs"): Trigger a callback function after a specified time.
  - time (number): The time value.
  - callback (function): The function to execute after the specified time.
  - unit (string, optional): Time unit ("milli", "secs", "mins", "hours").

- #### start(): Initialize the UI by applying default styles and preventing the context menu.

- #### get(selector): Query and return the first DOM element matching the selector.
  - selector (string): The CSS selector to query.
  - Returns: The matching DOM element or null.

- #### all(selector): Query and return all DOM elements matching the selector.
  - selector (string): The CSS selector to query.
  - Returns: A NodeList of matching DOM elements.

- #### text(element, newText): Get or set the inner text of a DOM element.
  - element (DOM element): The element to manipulate.
  - newText (string, optional): The new text content to set.
  - Returns: The current inner text of the element or sets the inner text.

- #### html(element, newHTML): Get or set the HTML content of a DOM element.
  - element (DOM element): The element to manipulate.
  - newHTML (string, optional): The new HTML content to set.
  - Returns: The current HTML content of the element or sets the HTML content.

- #### log(msg, clear = false): Log a message to the console with optional clearing.
  - msg (string): The message to log.
  - clear (boolean, optional): Clear the console before logging.

- #### styling methods for changing element appearance: foreground, background, font, size, pointer, select, padding, radius, and color.

- #### popup(message): Display a temporary popup notification on the screen.
  - message (string, optional): The message to be displayed in the popup. Defaults to "This is a notification."
  - Optional Customization Options (options parameter):
    - position (string, optional): The position of the popup on the screen. Can be "center" (default) or "top".
    - backgroundColor (string, optional): The background color of the popup. Default is "#222".
    - textColor (string, optional): The text color of the popup. Default is "white".
    - borderColor (string, optional): The border color of the popup. Default is "#333".
    - displayTime (number, optional): The duration in seconds for which the popup is displayed. Default is (4 seconds).
  - Returns: An automatically executed function that can be used as a reference for the popup.


- #### loaded(callback): Execute a callback function when the DOM is fully loaded.
  - callback (function): The function to execute when the DOM is ready.

#### Example Usage
```js
// Listen for clicks on a button
ui.listen(buttonElement, "click", () => {
  console.log("Button clicked!");
});

// Create a new div element with class and text
const newDiv = ui.create("div", { classes: ["box"], text: "Hello, world!" });

// Set gradient color to text
ui.color(newDiv, '#333', '#555', true)

// Set background color to element
ui.color(p, '#333')

// Set color to element
ui.color(p, '#333', null, true) // Todo: make it less verbose

// Remove a DOM element. It also automagically removes listeners!
ui.remove(newDiv);

// Wait for 2 seconds and then execute a callback. Don't need to handle setTimeout!
ui.wait(2, () => {
  ui.popup("Waited 2 seconds!");
});

// Apply default styles and prevent context menu
ui.start();

// Get an element by selector
const header = ui.get("header");

// Log a message and clear console
ui.log("Hello, world", true);

// Set foreground color for whole page
ui.foreground("red");

// Set background color for whole page
ui.background("black");
```

### Class db
#### Description
The db class provides a minimal subscription-based localStorage database. It allows easy data storage and automatic synchronization with UI components when data changes. Think of it as simple replacement for React auto-updating, perfect for prototypes or small-medium sized apps.

#### Properties
- subscriptions: An object that stores data change subscribers.
#### Methods
- #### clear(): Clear all data stored in the localStorage.

- #### set(key, value): Save data in the localStorage and trigger update callbacks.
  - key (string): The key to store data under.
  - value (any): The value to store.
    
- #### get(key, defaultValue = null): Retrieve data from the localStorage.

  - key (string): The key to retrieve data for.
  - defaultValue (any, optional): Default value to return if the key is not found.

- #### delete(key): Delete data associated with a key from the localStorage and trigger update callbacks.
  - key (string): The key to delete data for.
    
- #### subscribe(key, callback): Subscribe to data changes for a specific key.

  - key (string): The key to subscribe to.
  - callback (function): The function to execute when data changes.

- #### unsubscribe(key, callback): Unsubscribe a callback from data change events for a key.
  - key (string): The key to unsubscribe from.
  - callback (function): The callback function to remove.
    
#### Example Usage
```js
// Set data and subscribe to changes
db.set("username", "john_doe");
db.subscribe("username", (newValue) => {
  console.log(`Username changed to ${newValue}`);
});

// Get data from localStorage
const username = db.get("username");

// Delete data and trigger subscribers
db.delete("username");

// Unsubscribe from data changes
db.unsubscribe("username", myCallback);
```


## Note
Some features may not be completed or have limitations. For example, you cannot currently set fonts and backgrounds with gradients at the same time for an element. Other features are not fully tested yet. They were proven to work but not all cases are covered. db class is still alpha, do expect bugs.
