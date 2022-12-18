# TI4-Streamer-Buddy

### Setup instructions

Run the streamer buddy app on the TI4-TTPG host's computer, type "!buddy" into chat to have the mod start pushing data to buddy.

(The app runs a local webserver on ports 8080 and 8081, it does not need access to access to the filesystem if you want to sandbox it.)

### Developer information

Github actions build the app for Mac/Windows when the tag changes. Update the tag via:

Package.json version does not have a v, but tag does!

1. edit version in package.json (MUST BE "#.#.#")
2. git commit -am v#.#.#
3. git tag v#.#.# 
4. git push
5. git push --tags
