const assert = require("assert");

const _keyToData = {};

const getKeyHandler = (req, res) => {
  const args = {};
  req.url
    .split("?")[1]
    .split("&")
    .map((kv) => {
      parts = kv.split("=");
      args[parts[0]] = parts[1];
    });
  const key = args.key;
  assert(key);
  console.log(`getKeyHandler: key="${key}"`);

  const data = _keyToData[key];
  if (!data) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200);
  res.end(data);
};

getKeyHandler.__postKeyListener = (key, data) => {
  _keyToData[key] = data;
};

module.exports = getKeyHandler;
