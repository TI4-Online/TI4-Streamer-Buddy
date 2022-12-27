const fs = require("fs");
const http = require("http");
const https = require("https");
const { app, session, BrowserWindow } = require("electron");

const HTTP_PORT = 8080;
const HTTPS_PORT = 8081;

const { KeyDataHandler } = require("./handler/key-data");
const { RootHandler } = require("./handler/root");
const { AbstractHandler } = require("./handler/abstract-handler");
const { StaticHandler } = require("./handler/static");
const { OverlayRelayHandler } = require("./handler/overlay-relay");

let _httpServer = undefined;
let _httpsServer = undefined;

// Allow self-signed certificates for locally loaded web pages.  This applies
// when loading a github pages URL (requires HTTPS) which then reads from
// localhost HTTPS, serving the self-signed content.  Need to do this early,
// e.g. app.whenReady is too late.
app.commandLine.appendSwitch("ignore-certificate-errors");

const requestListener = AbstractHandler.getHTTPServerRequestListener([
  new KeyDataHandler(),
  new RootHandler(),
  new StaticHandler(),
  new OverlayRelayHandler(),
]);

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

  console.log("ARGV: " + JSON.stringify(process.argv));

  // 318x496 for Twitch panel.
  const win = new BrowserWindow({
    width: 1230,
    height: 496, // panel may be 100-500 heigth
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

  // Load the overlay from ti4-online.github.io, that way the overlay can be
  // updated independently of the electron app.
  let url = "https://ti4-online.github.io/overlay/overlay.html";

  // Allow command line to override URL.
  const urlFlagIndex = process.argv.indexOf("--url");
  if (urlFlagIndex >= 0) {
    // `python3 -m http.server` serves at `http://localhost:8000/`
    url = process.argv[urlFlagIndex + 1];
  }
  console.log(`url "${url}"`);
  console.assert(url.startsWith("http"));
  win.loadURL(url);

  // Command line to open the javascript console.
  if (process.argv.includes("--debug")) {
    win.webContents.openDevTools();
  }
});

// Quit the app when all windows are closed (Windows & Linux)
app.on("window-all-closed", () => {
  if (_httpServer) {
    _httpServer.close();
  }
  if (_httpsServer) {
    _httpsServer.close();
  }
  app.quit();
});
