#!/bin/sh
# Concatenate the dev files into two production files: dist/lv.css and dist/lv.js
# (image URLs are rewritten to ../assets/img/ so dist/ must sit next to assets/)
cd "$(dirname "$0")" || exit 1
mkdir -p dist
cat assets/css/0*.css assets/css/sections/*.css | sed 's#\.\./\.\./img/#../assets/img/#g; s#\.\./img/#../assets/img/#g' > dist/lv.css
cat assets/js/*.js > dist/lv.js
echo "Built dist/lv.css ($(wc -c < dist/lv.css) bytes) and dist/lv.js ($(wc -c < dist/lv.js) bytes)"
