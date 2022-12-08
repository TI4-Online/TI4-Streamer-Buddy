const { AbstractHandler } = require("./abstract-handler");

const fs = require("fs");

class RootHandler extends AbstractHandler {
  isMatch(url) {
    return url.pathname === "/";
  }

  handle(url, req, res) {
    const filename = __dirname + "/../../static/index.html";

    fs.readFile(filename, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(data);
    });
  }
}

module.exports = { RootHandler };
