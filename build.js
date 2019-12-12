const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const { uglify } = require('rollup-plugin-uglify');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const version = process.env.VERSION || require('./package.json').version;

const banner =
  '/*!\n' +
  ' * qrpc.js v' +
  version +
  '\n' +
  ' * (c) ' +
  new Date().getFullYear() +
  ' innotechx\n' +
  ' * Released under the MIT License.\n' +
  ' */\n';

async function build(inputOpts, outputOpts) {
  try {
    const bundle = await rollup.rollup(inputOpts);
    await bundle.write({
      ...outputOpts,
      name: 'WebIM'
    });
    await writeBanner(outputOpts.file);
  } catch (e) {
    console.error(e);
  }
}

function resolvePath(relativePath) {
  return path.resolve(__dirname, relativePath);
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb';
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}

function writeBanner(file) {
  return new Promise(function(resolve, reject) {
    const dest = resolvePath(file);
    let code = fs.readFileSync(dest, 'utf-8');
    code = banner + code;
    fs.writeFile(dest, code, function(err) {
      if (err) return reject(err);
      console.log(blue(dest) + ' ' + getSize(code));
      resolve();
    });
  });
}

['umd', 'esm'].forEach(format => {
  const ifUmd = format === 'umd';
  build(
    {
      input: resolvePath('src/index.js'),
      plugins: [
        resolve(),
        commonjs(),
        babel({
          exclude: 'node_modules/**'
        }),
        ifUmd && uglify()
      ]
    },
    {
      format,
      file: ifUmd ? 'qrpc.js' : 'qrpc.esm.js'
    }
  );
});
