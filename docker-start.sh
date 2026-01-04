#!/bin/sh

# Create devices.json if it doesn't exist
if [ ! -f devices.json ]; then
  if [ -f devices.example.json ]; then
    cp devices.example.json devices.json
  else
    echo '[]' > devices.json
  fi
fi

# Start the backend server
exec node dist/index.js
