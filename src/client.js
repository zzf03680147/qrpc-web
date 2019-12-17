import Completer from './completer';
import Frame from './frame';

const noop = () => {};

class Client {
  constructor({
    conf,
    addr,
    onopen = noop,
    onclose = noop,
    onerror = noop,
    onmessage = noop,
    onrequest = noop
  }) {
    this.conf = conf;
    this.respCache = {};
    this.addr = addr;
    this.onopen = onopen;
    this.onclose = onclose;
    this.onerror = onerror;
    this.onmessage = onmessage;
    this.onrequest = onrequest;
  }

  connect() {
    const connectCompleter = new Completer();

    const ws = new WebSocket(this.addr, null, {
      handshakeTimeout: this.conf.dialTimeout
    });

    this.ws = ws;

    ws.binaryType = 'arraybuffer';

    ws.onclose = e => {
      this.onclose(e);
    };

    ws.onopen = e => {
      this.onopen(e);
      connectCompleter.success(e);
    };

    ws.onerror = e => {
      this.onerror(e);
      connectCompleter.fail(e);
    };

    ws.onmessage = e => {
      if (typeof e.data === 'string') {
        return;
      }
      this.onmessage(e);

      const frame = Frame.decode(e.data);
      if (frame.requestID in this.respCache) {
        this.respCache[frame.requestID].success(frame);
        delete this.respCache[frame.requestID];
      }
    };
    return connectCompleter.getPromise();
  }

  request({ cmd, payload, flags = 0 }) {
    const frame = new Frame({
      cmd,
      payload,
      flags
    });
    const bytes = frame.encode();
    this.ws.send(bytes);
    this.request(bytes);
    const requestID = frame.requestID;
    this.respCache[requestID] = new Completer(this.conf.requestTimeout);
    return this.respCache[requestID].getPromise();
  }

  close() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
      this.ws = null;
      for (let rq in this.respCache) {
        this.respCache[rq].fail('server closed');
      }
      this.respCache = {};
    }
  }
}

export default Client;
