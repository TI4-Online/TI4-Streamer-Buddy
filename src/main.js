const fs = require("fs");
const http = require("http");
const https = require("https");
const { app, BrowserWindow } = require("electron");

const HTTP_PORT = 8080;
const HTTPS_PORT = 8081;

const getKeyHandler = require("./handler/get-key");
const postKeyHandler = require("./handler/post-key").__addPostKeyListener(
  getKeyHandler.__postKeyListener
);

const HANDLERS = {
  static: require("./handler/static"),
  postkey: postKeyHandler,
  postkey_ttpg: postKeyHandler,
  data: getKeyHandler,
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

// Open a window on start.
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 320,
    height: 500, // panel may be 100-500 heigth
  });
  postKeyHandler.__addPostKeyListener((key, data) => {
    win.loadURL("http://localhost:8080/static/panel.html");
  });

  // "curl -k" to tolerate this self-signed cert
  const options = {
    key: fs.readFileSync(__dirname + "/../cert/key.pem"),
    cert: fs.readFileSync(__dirname + "/../cert/cert.pem"),
  };
  const hostname = "localhost";
  const httpServer = http
    .createServer(requestListener)
    .listen(HTTP_PORT, hostname);
  const httpsServer = https
    .createServer(options, requestListener)
    .listen(HTTPS_PORT, hostname);
});

// Quit the app when all windows are closed (Windows & Linux)
app.on("window-all-closed", () => {
  console.log("window-all-closed, exiting");
  httpServer.close();
  httpsServer.close();
  app.quit();
});
