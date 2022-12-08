const { AbstractHandler } = require("./abstract-handler");

class KeyDataHandler extends AbstractHandler {
  constructor() {
    super();
    this._keyToData = {};
  }

  isMatch(url) {
    return (
      url.pathname === "/postkey" ||
      url.pathname === "/postkey_ttpg" ||
      url.pathname === "/data"
    );
  }

  handle(url, req, res) {
    if (url.pathname === "/data") {
      this._get(url, req, res);
    } else if (
      url.pathname === "/postkey" ||
      url.pathname === "/postkey_ttpg"
    ) {
      this._put(url, req, res);
    } else {
      throw new Error(`bad pathname "${url.pathname}`);
    }
  }

  _get(url, req, res) {
    const key = url.searchParams.get("key");

    // Always set access control and content type, even if an error.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Expose-Headers", "Last-Modified");
    res.setHeader("Cache-Control", "no-cache");

    // 400 Bad Request?
    if (!key) {
      res.writeHead(400);
      res.end();
      return;
    }

    // 404 Not Found?
    const data = this._keyToData[key];
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
      return;
    }

    // 200 OK.
    res.setHeader("Config-Length", data.data.length);
    res.writeHead(200);
    res.end(data.data);
  }

  _put(url, req, res) {
    const key = url.searchParams.get("key");

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

      this._keyToData[key] = {
        data: data,
        timestamp: new Date().toUTCString(),
      };
    });
  }
}

module.exports = { KeyDataHandler };
