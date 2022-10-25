const fs = require("fs");
const http = require("http");
const https = require("https");
const { app, session, BrowserWindow } = require("electron");

const HTTP_PORT = 8080;
const HTTPS_PORT = 8081;

const KeyDataHandler = require("./handler/key-data");
const RootHandler = require("./handler/root");

const HANDLERS = {
  static: require("./handler/static"),
  postkey: KeyDataHandler.postHandler,
  postkey_ttpg: KeyDataHandler.postHandler,
  data: KeyDataHandler.getHandler,
  "": RootHandler,
  "index.html": RootHandler,
};

let _httpServer = undefined;
let _httpsServer = undefined;

const requestListener = function (req, res) {
  const handlerName = req.url.split("/")[1].split("?")[0];
  const handler = HANDLERS[handlerName];
  if (handler) {
    handler(req, res);
  } else {
    console.log(`no handler for "${req.url}"`);
    res.writeHead(404);
    res.end();
  }
};

// Specify a content security policy.
// https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy
function setSecurityPolicy() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["script-src 'self'"],
      },
    });
  });
}

// Open a window on start.
// (https://dev.twitch.tv/docs/extensions/designing):
// Panel Extensions are limited to 318px wide x 496px high, to avoid iframe
// scrolling. Within these limits, try to allow 10px of inner padding for any
// text within your extension, for maximum readability.
app.whenReady().then(() => {
  setSecurityPolicy();
  const win = new BrowserWindow({
    width: 320,
    height: 500, // panel may be 100-500 heigth
  });
  win.loadURL("http://localhost:8080/index.html");
  //KeyDataHandler.addOnPostListener((key, data) => {
  //  win.loadURL("http://localhost:8080/static/panel.html");
  //});

  // "curl -k" to tolerate this self-signed cert
  const options = {
    key: fs.readFileSync(__dirname + "/../cert/key.pem"),
    cert: fs.readFileSync(__dirname + "/../cert/cert.pem"),
  };
  const hostname = "localhost";
  _httpServer = http.createServer(requestListener).listen(HTTP_PORT, hostname);
  _httpsServer = https
    .createServer(options, requestListener)
    .listen(HTTPS_PORT, hostname);
});

// Quit the app when all windows are closed (Windows & Linux)
app.on("window-all-closed", () => {
  console.log("window-all-closed, exiting");
  if (_httpServer) {
    _httpServer.close();
  }
  if (_httpsServer) {
    _httpsServer.close();
  }
  app.quit();
});
