#!/bin/bash
# contact sheet: tools/sheet.sh <outfile> <cols> <scale> t1,t2,...
set -e
OUT=$1; COLS=$2; SC=$3; TIMES=$4; D=$(mktemp -d)
node "$(dirname "$0")/render.mjs" --scale $SC --times $TIMES --out $D | tail -2
N=$(ls $D/*.png | wc -l); ROWS=$(( (N + COLS - 1) / COLS ))
ffmpeg -v error -y -pattern_type glob -i "$D/*.png" -vf "tile=${COLS}x${ROWS}:padding=6:color=0x222222" -frames:v 1 "$OUT"
rm -rf $D
