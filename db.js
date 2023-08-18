class db {
  // Minimal Subscription
  // This is a localStorage database that makes it easy to save data
  // It also automatically synchronises UI when data changes

  static subscriptions = {};

  static clear() {
    localStorage.clear();
  }

  static set(key, value) {
    // Save data and trigger update callback
    localStorage.setItem(key, JSON.stringify(value));
    this.triggerSubscribers(key, value);
  }

  static get(key, defaultValue = null) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  static delete(key) {
    localStorage.removeItem(key);
    this.triggerSubscribers(key, null);
  }

  static subscribe(key, callback) {
    if (!this.subscriptions[key]) {
      this.subscriptions[key] = [];
    }
    this.subscriptions[key].push(callback);
  }

  static unsubscribe(key, callback) {
    const subscribers = this.subscriptions[key];
    if (subscribers) {
      this.subscriptions[key] = subscribers.filter((cb) => cb !== callback);
    }
  }

  static triggerSubscribers(key, value) {
    const subscribers = this.subscriptions[key];
    if (subscribers) {
      subscribers.forEach((callback) => {
        callback(value);
      });
    }
  }
}
