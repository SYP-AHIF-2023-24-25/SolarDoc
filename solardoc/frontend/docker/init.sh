#!/bin/bash

ROOT_DIR=/etc/nginx/
HTML_DIR=/usr/share/nginx/html/

# Insert runtime variables
echo "[init.sh] Inserting runtime variables using import-meta-env script..."
"$ROOT_DIR/import-meta-env" -x $HTML_DIR/.env.prod.template -p "$HTML_DIR/index.html" || exit 1
echo "[init.sh] Inserting runtime variables using import-meta-env script... Done!"

# Start NGINX server
echo "[init.sh] Starting NGINX server..."
nginx -g 'daemon off;'
