#!/bin/sh

set -eu

NODE_ENV=test npm run concurrently -- -k \
  "npm run watch:client" \
# "npm run build:server && NODE_ENV=test npm start"