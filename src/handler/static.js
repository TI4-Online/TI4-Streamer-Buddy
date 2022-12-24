const fs = require("fs");
const { AbstractHandler } = require("./abstract-handler");

const SUFFIX_TO_CONTENT_TYPE = {
  css: "text/css",
  html: "text/html",
  jpg: "image/jpeg",
  js: "text/javascript",
  png: "image/png",
};

class StaticHandler extends AbstractHandler {
  isMatch(url) {
    return url.pathname.startsWith("/static/");
  }

  handle(url, req, res) {
    const filename = __dirname + "/../.." + url.pathname;
    const ext = filename.split(".").pop();
    const contentType = SUFFIX_TO_CONTENT_TYPE[ext];
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    res.setHeader("Access-Control-Allow-Origin", "*");

    fs.readFile(filename, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}

module.exports = { StaticHandler };
