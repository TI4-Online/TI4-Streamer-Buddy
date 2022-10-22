const assert = require("assert");

const _keyToData = {};
const _onGetListeners = [];
const _onPostListeners = [];

class KeyDataHandler {
  constructor() {
    throw new Error("static only");
  }

  static addOnPostListener(listener) {
    _onPostListeners.push(listener);
  }

  static addOnGetListener(listener) {
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

      // Always set access control, even if an error.
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Expose-Headers", "Last-Modified");
      res.setHeader("Cache-Control", "no-cache");

      // 400 Bad Request?
      if (!key) {
        res.writeHead(400);
        res.end();
        return;
      }

      // 404 Not Found?
      const data = _keyToData[key];
      if (!data) {
        res.writeHead(404);
        res.end();
        return;
      }

      const lastModified = data.timestamp;
      res.setHeader("Last-Modified", lastModified);

      // 304 Not Modified?
      // Just do an exact string compare, respond even if older.
      const ifModifiedSince = req.headers["if-modified-since"]; // lowercase
      if (ifModifiedSince && ifModifiedSince === lastModified) {
        res.writeHead(304);
        res.end();
        for (const listener of _onGetListeners) {
          listener(key, 304);
        }
        return;
      }

      // 200 OK.
      res.writeHead(200);
      res.end(data.data);
      for (const listener of _onGetListeners) {
        listener(key, 200);
      }
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
      if (!key) {
        res.writeHead(400);
        res.end();
        return;
      }

      // Handler is called early, POST body might still be arriving.
      // Collect full POST body before finishing request.
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });
      req.on("end", () => {
        res.writeHead(200);
        res.end();

        _keyToData[key] = {
          data: data,
          timestamp: new Date().toUTCString(),
        };

        for (const listener of _onPostListeners) {
          listener(key, 200);
        }
      });
    };
  }
}

module.exports = KeyDataHandler;
