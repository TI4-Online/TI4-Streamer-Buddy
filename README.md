# TI4-Streamer-Buddy

Run the streamer buddy app on the TI4-TTPG host's computer, type "!buddy" into chat to have the mod start pushing data to buddy.

Github actions build the app for Mac/Windows when the tag changes. Update the tag via:

Package.json version does not have a v, but tag does!

1. edit version in package.json (MUST BE "#.#.#")
2. git commit -am $VERSION
3. git tag $VERSION
4. git push
5. git push --tags
