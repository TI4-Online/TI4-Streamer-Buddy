/**
 * Fetch gamedata json at regular inverals, using last-modified timestamp to
 * avoid processing already-delivered results.
 *
 * Include this script and register an 'onGameDataUpdate' event listener:
 *
 * window.addEventListener("onGameDataUpdate", (json) => {
 *   console.log("onGameDataUpdate");
 * });
 */

let _lastModified = "n/a";

const loopFetch = () => {
  fetch("/data?key=buddy", {
    cache: "no-cache",
    mode: "no-cors",
    headers: { "If-Modified-Since": _lastModified },
  }).then((response) => {
    if (response.status === 304) {
      return; // not modified
    } else if (response.status !== 200) {
      console.error(`loopFetch response status ${response.status}`);
      return;
    }

    const lastModified = response.headers.get("Last-Modified");
    if (lastModified && lastModified === _lastModified) {
      // Cache gave us the same result as last time, ignore it.
      return;
    }
    _lastModified = lastModified;

    response.json().then((json) => {
      const event = new CustomEvent("onGameDataUpdate", json);
      window.dispatchEvent(event);
    });
  });
};

window.addEventListener("DOMContentLoaded", (window, event) => {
  setInterval(loopFetch, 3000);
  loopFetch(); // run immediately too
});
