const assert = require("assert");

const _postKeyListeners = [];

const postKeyHandler = (req, res) => {
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

    // Invoke any callbacks from an independent state.
    for (const listener of _postKeyListeners) {
      process.nextTick(() => {
        listener(key, data);
      });
    }
  });
};

postKeyHandler.__addPostKeyListener = (listener) => {
  assert(typeof listener === "function");
  _postKeyListeners.push(listener);
  return postKeyHandler;
};

module.exports = postKeyHandler;
