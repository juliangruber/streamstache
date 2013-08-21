#!/usr/bin/env bash

browserify -s streamstache index.js > dist/streamstache.js
uglifyjs dist/streamstache.js -o dist/streamstache.min.js -m -r streamstache -c
