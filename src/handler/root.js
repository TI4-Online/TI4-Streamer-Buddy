const fs = require("fs");

const rootHanlder = (req, res) => {
  const filename = __dirname + "/../../static/index.html";

  fs.readFile(filename, (err, data) => {
    if (err) {
      console.log(`rootHanlder: missing "${filename}"`);
      res.writeHead(404);
      res.end();
      return;
    }
    console.log(`rootHanlder: serving "${filename}"`);
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(data);
  });
};

module.exports = rootHanlder;
