let _lastModified = "n/a";
let _loopFetchHandle = undefined;

// How to listen for updates:
window.addEventListener("onLoopFetchResult", (json) => {
  console.log("onLoopFetchResult");
});

const loopFetch = async () => {
  await fetch("/data?key=buddy", {
    cache: "no-cache",
    mode: "no-cors",
    headers: { "If-Modified-Since": _lastModified },
  }).then((response) => {
    console.log(`response status ${response.status}`);
    if (response.status === 304) {
      console.log("loopFetch not modified");
      return; // not modified
    } else if (response.status !== 200) {
      console.error(`loopFetch response status ${response.status}`);
      return;
    }

    const lastModified = response.headers.get("Last-Modified");
    if (lastModified && lastModified === _lastModified) {
      // Cache gave us the same result as last time, ignore it.
      console.log("loopFetch last-modified unchanged");
      return;
    }
    _lastModified = lastModified;

    response.json().then((json) => {
      console.log(`loopFetch success, lastModified: "${_lastModified}`);
      const event = new CustomEvent("onLoopFetchResult", json);
      window.dispatchEvent(event);
    });
  });
};

window.addEventListener("DOMContentLoaded", (window, event) => {
  console.log("loopFetch start");
  _loopFetchHandle = setInterval(loopFetch, 3000);

  // Also run right away.
  loopFetch();
});
