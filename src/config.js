class Config {
  constructor({ dialTimeout = 1000, requestTimeout = 2000 }) {
    this._dialTimeout = dialTimeout;
    this._requestTimeout = requestTimeout;
  }

  get dialTimeout() {
    return this._dialTimeout;
  }

  setDialTimeout(timeout) {
    this._dialTimeout = timeout;
  }

  get requestTimeout() {
    return this._requestTimeout;
  }

  set requestTimeout(timeout) {
    this._requestTimeout = timeout;
  }
}

export default Config;
