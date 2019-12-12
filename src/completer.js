class Completer {
  constructor(timeout) {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    if (timeout > 0) {
      this._id = setTimeout(() => {
        this._reject('timeout');
      }, timeout);
    }
  }

  getPromise() {
    return this._promise;
  }

  success(data) {
    this._resolve(data);
    this._complete();
  }

  fail(reason) {
    this._reject(reason);
    this._complete();
  }

  _complete() {
    if (this._id) {
      clearTimeout(this._id);
      this._id = null;
    }
  }
}

export default Completer;
