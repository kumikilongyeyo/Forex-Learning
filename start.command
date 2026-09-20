#!/bin/bash
cd "$(dirname "$0")"
node scripts/serve.mjs &
PID=$!
sleep 1
open http://127.0.0.1:4173
wait $PID
