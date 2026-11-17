#!/bin/bash
# Parallel deterministic render: tools/render-all.sh <scale> <framesDir> [workers]
set -e
cd "$(dirname "$0")/.."
SC=${1:-1}; OUT=${2:-frames}; W=${3:-4}; DUR=$(python3 -c "import json;print(json.load(open('plan.json'))['duration'])")
mkdir -p "$OUT"
for i in $(seq 0 $((W-1))); do
  A=$(python3 -c "print($DUR*$i/$W)"); B=$(python3 -c "print($DUR*($i+1)/$W)")
  node tools/render.mjs --scale $SC --from $A --to $B --out "$OUT" --fmt ${FMT:-png} > "$OUT/worker$i.log" 2>&1 &
done
wait
cat "$OUT"/worker*.log
