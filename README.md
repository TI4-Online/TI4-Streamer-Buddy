# TI4-Streamer-Buddy

## Setup instructions

Download the streamer buddy app from [releases](https://github.com/TI4-Online/TI4-Streamer-Buddy/releases).

Run the streamer buddy app on the TI4-TTPG host's computer, type "!buddy" into chat to have the mod start pushing data to buddy.

To use with OBS, start the app then load "[http://localhost:8080/overlay/overlay.html](http://localhost:8080/overlay/overlay.html)" there.

#### Running app on a Mac

On a mac: right click the application and select "open" (it is not signed by a trusted authority, double clicking the app with the normal security settings prevents you from starting it).

#### App updates

Buddy loads an overlay hosted online, the overlay can be updated without needing a new version of the streamer buddy app.  It is possible future features could require downloading a new version (most likely adding new image assets), but those major changes should be rare.

## Security

The app runs a local webserver on ports 8080 and 8081, it does not need access to access to the filesystem beyond loading the app itself.

## Developer information

Github actions build the app for Mac/Windows when the tag changes. Update the tag via:

Package.json version does not have a v, but tag does!

1. edit version in package.json (MUST BE "#.#.#")
2. git commit -am v#.#.#
3. git tag v#.#.# 
4. git push
5. git push --tags
