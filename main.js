/*
**  Nuxt
*/

const {execFile} = require('mz/child_process');
const {readFile} = require('mz/fs');
const crypto = require('crypto');
const electron = require('electron');
const path = require('path');
const http = require('http');
const {Nuxt, Builder} = require('nuxt');
const config = require('./nuxt.config.js');

let waifu2xDisabled = false;

config.rootDir = __dirname; // for electron-builder
// Init Nuxt.js
const nuxt = new Nuxt(config);
const builder = new Builder(nuxt);

const imageProxy = async (req, res) => {
  if (req.url.startsWith('/img?data=')) {
    const data = JSON.parse(decodeURIComponent(req.url.replace('/img?data=', '')));
    const imageURL = data.url;
    const enableWaifu2x = data.enableWaifu2x;
    const hash = crypto.createHash('md5').update(imageURL).digest('hex');
    const [destFile, enhancedFile] = [`/tmp/${hash}.webp`, `/tmp/${hash}.png`];
    await execFile('wget', ['--header', 'Referer: https://www.manhuagui.com/', imageURL, '-O', destFile]);
    let buf;
    if (enableWaifu2x && !waifu2xDisabled) {
      try {
        await execFile('schedtool', ['-D', '-e', 'waifu2x-converter-cpp', '--disable-gpu', '--block-size', '1024', '-m', 'noise', '-i', destFile, '-o', enhancedFile]);
        buf = await readFile(enhancedFile);
      } catch (e) {
        console.error(e);
        waifu2xDisabled = true;
      }
    }
    if (!buf) {
      buf = await readFile(destFile);
    }
    await execFile('rm', ['-f', destFile, enhancedFile]);
    return res.end(buf);
  }
  return nuxt.render(req, res);
};

const server = http.createServer(imageProxy);
// Build only in dev mode
if (config.dev) {
  builder.build().catch((err) => {
    console.error(err); // eslint-disable-line no-console
    process.exit(1);
  });
}
// Listen the server
server.listen();
const _NUXT_URL_ = `http://localhost:${server.address().port}`;
console.log(`Nuxt working on ${_NUXT_URL_}`);

/*
** Electron
*/
let win = null; // Current window

const app = electron.app;
const newWin = () => {
  win = new electron.BrowserWindow({
    icon: path.join(__dirname, 'static/icon.png')
  });
  win.maximize();

  const filter = {
    urls: ['http://*/*', 'https://*/*']
  };
  electron.session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders.Referer = 'https://www.manhuagui.com/';
    details.requestHeaders.Origin = 'https://www.manhuagui.com/';
    callback({cancel: false, requestHeaders: details.requestHeaders});
  });

  win.on('closed', () => { win = null; });
  if (config.dev) {
    // Install vue dev tool and open chrome dev tools
    const {default: installExtension, VUEJS_DEVTOOLS} = require('electron-devtools-installer');
    installExtension(VUEJS_DEVTOOLS.id).then((name) => {
      console.log(`Added Extension:  ${name}`);
      win.webContents.openDevTools();
    }).catch(err => console.log('An error occurred: ', err));
    // Wait for nuxt to build
    const pollServer = () => {
      http.get(_NUXT_URL_, (res) => {
        if (res.statusCode === 200) { win.loadURL(_NUXT_URL_); } else { setTimeout(pollServer, 300); }
      }).on('error', pollServer);
    };
    pollServer();
  } else {
    return win.loadURL(_NUXT_URL_);
  }
  return null;
};

app.on('ready', newWin);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => win === null && newWin());
