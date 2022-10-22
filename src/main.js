const fs = require("fs");
const http = require("http");
const https = require("https");
const { app, BrowserWindow } = require("electron");

const HTTP_PORT = 8080;
const HTTPS_PORT = 8081;

const KeyDataHandler = require("./handler/key-data");

const HANDLERS = {
  static: require("./handler/static"),
  postkey: KeyDataHandler.postHandler,
  postkey_ttpg: KeyDataHandler.postHandler,
  data: KeyDataHandler.getHandler,
  "": require("./handler/root"),
};

const requestListener = function (req, res) {
  console.log(req.url);
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

let _httpServer = undefined;
let _httpsServer = undefined;

// Open a window on start.
// (https://dev.twitch.tv/docs/extensions/designing):
// Panel Extensions are limited to 318px wide x 496px high, to avoid iframe
// scrolling. Within these limits, try to allow 10px of inner padding for any
// text within your extension, for maximum readability.
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 320,
    height: 500, // panel may be 100-500 heigth
  });
  KeyDataHandler.addOnPostListener((key, data) => {
    win.loadURL("http://localhost:8080/static/panel.html");
  });

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
