class db {
  static subscriptions = {};

  static clear() {
    localStorage.clear();
  }

  static isFirstTime() {
    const isFirstTime = !localStorage.getItem('app_loaded_before');
    if (isFirstTime) {
      localStorage.setItem('app_loaded_before', 'true');
    }
    return isFirstTime;
  }

  static resetFirstTime() {
    localStorage.removeItem('app_loaded_before');
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this.trigger(key, value);
  }

  static get(key, defaultValue = null) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  static delete(key) {
    localStorage.removeItem(key);
    this.trigger(key, null);
  }

  static subscribe(key, elementsToUpdate, callback) {
    if (!this.subscriptions[key]) {
      this.subscriptions[key] = [];
    }

    // Store the elements to update along with the callback
    this.subscriptions[key].push({ elementsToUpdate, callback });
  }

  static unsubscribe(key, callback) {
    const subscribers = this.subscriptions[key];
    if (subscribers) {
      this.subscriptions[key] = subscribers.filter(
        (subscriber) => subscriber.callback !== callback
      );
    }
  }

  static trigger(key, value) {
    const subscribers = this.subscriptions[key];
    if (subscribers) {
      subscribers.forEach((subscriber) => {
        const { elementsToUpdate, callback } = subscriber;

        // Call the callback for each element to update
        elementsToUpdate.forEach((element) => {
          callback(element, value);
        });
      });
    }
  }
}
