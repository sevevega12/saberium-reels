#!/bin/bash
# tools/encode.sh <framesDir> <ext> <out.mp4> [crf]
set -e
cd "$(dirname "$0")/.."
ffmpeg -v error -y -framerate 30 -i "$1/f%05d.$2" -i out/audio-mix.wav \
  -c:v libx264 -preset slow -crf ${4:-17} -pix_fmt yuv420p -vf "scale=out_color_matrix=bt709:out_range=tv" -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -r 30 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -t $(python3 -c "import json;print(json.load(open('plan.json'))['duration'])") "$3"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_frames -of compact "$3"
