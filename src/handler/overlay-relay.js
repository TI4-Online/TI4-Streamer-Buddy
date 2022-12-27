const { AbstractHandler } = require("./abstract-handler");
const fetchLib = require("electron-fetch");
const fetch = fetchLib.default;

console.log(fetch);

const SUFFIX_TO_CONTENT_TYPE = {
  css: "text/css",
  html: "text/html",
  jpg: "image/jpeg",
  js: "text/javascript",
  png: "image/png",
};

class OverlayRelayHandler extends AbstractHandler {
  isMatch(url) {
    return url.pathname.startsWith("/overlay/");
  }

  handle(url, req, res) {
    const remoteUrl = "https://ti4-online.github.io" + url.pathname;

    const ext = url.pathname.split(".").pop();
    const contentType = SUFFIX_TO_CONTENT_TYPE[ext];
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    fetch(remoteUrl)
      .then((remoteRes) => {
        remoteRes.buffer().then((buffer) => {
          res.writeHead(200);
          res.end(buffer);
        });
      })
      .catch((error) => {
        res.writeHead(500);
        res.end();
      });
  }

  _processError(error) {}
}

module.exports = { OverlayRelayHandler };
