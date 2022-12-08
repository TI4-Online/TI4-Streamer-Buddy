const assert = require("assert");

class AbstractHandler {
  static getHTTPServerRequestListener(handlers) {
    assert(Array.isArray(handlers));
    for (const handler of handlers) {
      assert(handler instanceof AbstractHandler);
    }
    return (req, res) => {
      const url = new URL(`http://localhost${req.url}`);
      for (const handler of handlers) {
        if (handler.isMatch(url)) {
          handler.handle(url, req, res);
          //console.log(`request "${req.url}" -> ${res.statusCode}`);
          return;
        }
      }
      res.writeHead(404);
      res.end();
    };
  }

  constructor() {}

  isMatch(url) {
    throw new Error("subclass should override");
  }

  handle(url, req, res) {
    throw new Error("subclass should override");
  }
}

module.exports = { AbstractHandler };
