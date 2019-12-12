import qrpc from './qrpc.esm.js';
import cmd from './cmd.js';

const { Frame, Config, Client } = qrpc;

// https://github.com/nodeca/pako
Frame.unzipAdapter = payload => {
  return pako.ungzip(payload, { to: 'string' });
};

// util
const getById = id => document.getElementById(id);

const log = function(val, msgType = 'error') {
  const preNode = getById('pre');
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  preNode.innerText = val;
  getById('type').innerText = msgType;
  if (msgType === 'error') {
    preNode.classList.add('isError');
  } else {
    preNode.classList.remove('isError');
  }
};

const stringify = function(val) {
  try {
    return JSON.stringify(val, null, 2);
  } catch (e) {
    return e;
  }
};

// 填充cmd
const initCmd = function() {
  const frag = document.createDocumentFragment();

  Object.keys(cmd).forEach(function(c) {
    const option = frag.appendChild(document.createElement('option'));
    option.text = `${cmd[c]}(${c})`;
    option.value = cmd[c];
  });
  getById('cmd').appendChild(frag);
};
initCmd();

getById('payload').value = stringify({
  app: 3,
  device: 'mac',
  token: 'cs',
  uid: 'cs1'
});

let client = null;

const sendMsg = async function() {
  try {
    let payload = getById('payload').value.trim();
    if (payload !== '') {
      payload = eval(`(${payload})`);
    }
    const frame = await client.request({
      cmd: getById('cmd').value,
      payload: JSON.stringify(payload)
    });
    log(`${stringify(JSON.parse(frame.payload))}`, 'message');
  } catch (e) {
    log(`${stringify(e)}`);
  }
};

// listener
getById('connect').onclick = async function() {
  const addr = `${getById('protocol').value}://${getById('url').value}:${
    getById('port').value
  }/qrpc`;

  client = new Client({
    addr,
    conf: new Config({
      dialTimeout: 1000,
      requestTimeout: 2000
    }),
    onclose: e => {
      log(`${stringify(e)}`, 'close');
    },
    onopen: e => {
      log(`${stringify(e)}`, 'open');
    },
    onerror: e => {
      log(`${stringify(e)}`);
    },
    onmessage: e => {
      log(`${stringify(e)}`, 'message');
    }
  });
  await client.connect();
  await sendMsg();

  getById('connect').disabled = true;
  getById('close').disabled = false;
  getById('send').disabled = false;
};

getById('send').onclick = sendMsg;

getById('close').onclick = function() {
  client && client.close();
  client = null;

  getById('connect').disabled = false;
  getById('close').disabled = true;
  getById('send').disabled = true;
  getById('cmd').value = 0;
};

getById('payload').onblur = function() {
  try {
    let val = this.value.trim();
    if (val !== '') {
      val = eval(`(${val})`);
      this.value = stringify(val);
    }
  } catch (e) {}
};
