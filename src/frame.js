class Frame {
  constructor({ flags = 0, cmd, payload, requestID }) {
    this.flags = flags;
    this.cmd = cmd;
    this.payload = payload;
    this.requestID = requestID || this.genRequestID();
  }

  static get unzipAdapter() {
    return Frame._unzipAdapter;
  }

  static set unzipAdapter(unzipAdapter) {
    Frame._unzipAdapter = unzipAdapter;
  }

  static decode(buffer) {
    const bytes = new Uint8Array(buffer);
    const size =
      (bytes[0] << 24) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
    const requestID = bytes.subarray(4, 12);
    const flags = bytes[12];
    const cmd = (bytes[13] << 16) + (bytes[14] << 8) + bytes[15];

    let payload = bytes.subarray(16, size + 4);

    const zipFlagPos = 6; // zip flag
    const bFlags = flags.toString(2);
    if (bFlags.charAt[bFlags.length - zipFlagPos] === '1') {
      payload = Frame.unzipAdapter(payload);
    } else {
      payload = Frame.textDecoder.decode(payload);
    }

    return new Frame({
      flags,
      cmd,
      payload,
      requestID
    });
  }

  encode() {
    const payload = Frame.textEncoder.encode(this.payload);
    const size = 12 + payload.length;
    const bytes = new Uint8Array(size + 4);

    bytes[0] = size >> 24;
    bytes[1] = size >> 16;
    bytes[2] = size >> 8;
    bytes[3] = size;

    bytes.set(this.requestID, 4);

    bytes[12] = this.flags;
    bytes[13] = this.cmd >> 16;
    bytes[14] = this.cmd >> 8;
    bytes[15] = this.cmd;

    bytes.set(payload, 16);
    return bytes;
  }

  genRequestID() {
    while (true) {
      const bytes = new Uint32Array(2);
      bytes[0] = Math.floor(Math.random() * (2 ** 32 - 1));
      bytes[1] = Math.floor(Math.random() * (2 ** 32 - 1));
      const requestID = new Uint8Array(bytes.buffer);
      if (!Frame.requestIDCached[requestID]) {
        Frame.requestIDCached[requestID] = true;
        return requestID;
      }
    }
  }

  genHexRequestID() {
    return Array.from(this.requestID)
      .map(n => n.toString(16))
      .join('');
  }
}

Frame.textEncoder = new TextEncoder('utf-8');
Frame.textDecoder = new TextDecoder('utf-8');
Frame._unzipAdapter = payload => payload;
Frame.requestIDCached = {};

export default Frame;
