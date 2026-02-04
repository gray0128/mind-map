#!/bin/bash

# Ensure directory exists
# Assumes running from cloud-app root
mkdir -p public/editor

# Copy assets
echo "Copying assets from ../dist..."
cp -r ../dist/* ./public/editor/

# Copy index.html
echo "Copying index.html..."
cp ../index.html ./public/editor/index.html

# Inject cloudSave.js
echo "Injecting cloudSave.js..."
# Using sed to insert script before body end tag
# Note: This is a simple replacement.
sed -i '' 's|</body>|<script src="/cloudSave.js"></script></body>|' ./public/editor/index.html

echo "Done. Editor assets ready."
