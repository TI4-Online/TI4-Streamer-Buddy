/**
 * Fetch gamedata json at regular inverals, using last-modified timestamp to
 * avoid processing already-delivered results.
 *
 * Include this script and register an 'onGameDataUpdate' event listener:
 *
 * window.addEventListener("onGameDataUpdate", (event) => {
 *   console.log(`onGameDataUpdate ${event.detail.timestamp}`);
 * });
 */

let _lastModified = "n/a";

const processResponse = (response) => {
  // Check if the response is "not modified" from our if-modified-since request.
  if (response.status === 304) {
    return; // not modified
  }

  // Stop if error.  Report the status code if other than "not found"
  if (response.status !== 200) {
    if (response.status !== 404) {
      console.error(`loopFetch response status ${response.status}`);
    }
    return;
  }

  // The above 304 check fails if the cache rewrites it to a 200 using cached
  // content.  Consult the last-modified time, only process if different.
  const lastModified = response.headers.get("Last-Modified");
  if (lastModified && lastModified === _lastModified) {
    return;
  }
  _lastModified = lastModified; // remember

  // Report update to listeners via a custom event. The event extra data
  // MUST be stored using the reserved key 'detail'.
  response.json().then((json) => {
    const event = new CustomEvent("onGameDataUpdate", { detail: json });
    window.dispatchEvent(event);
  });
};

const processError = (error) => {
  console.log(`ERROR "${error}`);
};

const loopFetch = () => {
  fetch("/data?key=buddy", {
    cache: "no-cache",
    mode: "no-cors",
    headers: { "If-Modified-Since": _lastModified },
  })
    .then(processResponse)
    .catch(processError);
};

window.addEventListener("DOMContentLoaded", (window, event) => {
  setInterval(loopFetch, 3000);
  loopFetch(); // run immediately too
});
