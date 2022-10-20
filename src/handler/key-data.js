const assert = require("assert");

const _keyToData = {};
const _onPostListeners = [];

class KeyDataHandler {
  constructor() {
    throw new Error("static only");
  }

  static addOnPostListener(listener) {
    _onPostListeners.push(listener);
  }

  static get getHandler() {
    return (req, res) => {
      const args = {};
      req.url
        .split("?")[1]
        .split("&")
        .map((kv) => {
          const parts = kv.split("=");
          args[parts[0]] = parts[1];
        });
      const key = args.key;
      assert(key);
      console.log(`getKeyHandler: key="${key}"`);

      res.setHeader("Access-Control-Allow-Origin", "*");
      const data = _keyToData[key];
      if (!data) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200);
      res.end(data);
    };
  }

  static get postHandler() {
    return (req, res) => {
      const args = {};
      req.url
        .split("?")[1]
        .split("&")
        .map((kv) => {
          const parts = kv.split("=");
          args[parts[0]] = parts[1];
        });
      const key = args.key;
      assert(key);
      console.log(`postKeyHandler: key="${key}"`);

      // Handler is called early, POST body might still be arriving.
      // Collect full POST body before finishing request.
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        console.log(`postKeyHandler: key="${key}" |data|=${data.length}`);
        res.writeHead(200);
        res.end();

        _keyToData[key] = data;
        for (const listener of _onPostListeners) {
          listener(key, data);
        }
      });
    };
  }
}

module.exports = KeyDataHandler;
