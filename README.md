### 一、测试

```javascript
yarn test or npm test
```

### 二、初始化

```javascript
import qrpc from 'qrpc';

const { Connector, Config } = qrpc;

const connector = new Connector({
  addr: 'wss://im.t.ywopt.com:8901/qrpc',
  conf: new Config({
    dialTimeout: 1000,
    requestTimeout: 2000
  }),
  onopen: e => {
    console.log(e);
  },
  onmessage: e => {
    console.log(e);
  }
});

(async function() {
  try {
    await connector.init();

    const cmd = 0;
    const flags = 0;
    const loginRequest = { app: 3, uid: 'cs1', device: 'mac', token: 'cs' };
    const payload = JSON.stringify(loginRequest);

    const frame = await connector.request({
      cmd,
      flags,
      payload
    });
    console.log(frame.payload);
  } catch (errer) {
    console.errer(errer);
  }
})();
```
