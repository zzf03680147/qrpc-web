qrpc-web
==========================================

>  a JavaScript library that lets browser clients access a qRPC service. You can find out much more about qRPC
[website](https://github.com/zhiqiangxu/qrpc).


Install
-------------

```sh
$ npm i qrpc-web
```

Example & API
-------------
example - https://codesandbox.io/s/stoic-hawking-lk50t

```javascript
import qrpc from 'qrpc-web';

const { Client, Config } = qrpc;

;(async function() {
  const client = new Client({
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

  try {
    await client.connect();

    const cmd = 0;
    const flags = 0;
    const loginRequest = { app: 3, uid: 'cs1', device: 'mac', token: 'cs' };
    const payload = JSON.stringify(loginRequest);

    const frame = await client.request({
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

Test
-------------

```sh
$ npm test
```
