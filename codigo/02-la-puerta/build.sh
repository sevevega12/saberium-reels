#!/bin/bash
# Rebuilds the whole Reel from out/timing.json (the only timing source).
#   python3 src/timing_from_voice.py   -> timing.json from the real voice (edit PHRASES there to move phrases)
#   ./build.sh                         -> frames, music, voice, mix, contact sheet
#   ./build.sh audio                   -> only redo the sound on the existing picture
set -e
cd "$(dirname "$0")"
mkdir -p work out
lufs(){ ffmpeg -hide_banner -i "$1" -af loudnorm=I=-24:TP=-3:print_format=json -f null - 2>&1 | python3 -c "import sys,json;t=sys.stdin.read();print(json.loads(t[t.rindex('{'):])['input_i'])"; }
if [ "$1" != "audio" ]; then
  D=$(python3 -c "import json;print(json.load(open('out/timing.json'))['duration'])")
  H=$(python3 -c "print(round($D/2*30)/30)")
  python3 src/render.py video work/v1.mp4 0 $H 1 &
  python3 src/render.py video work/v2.mp4 $H 0 1 &
  wait
  printf "file v1.mp4\nfile v2.mp4\n" > work/list.txt
  ffmpeg -v error -y -f concat -i work/list.txt -c copy work/video.mp4
fi
python3 src/audio.py work/music_raw.wav
GM=$(python3 -c "print(round(-24-($(lufs work/music_raw.wav)),2))")
ffmpeg -v error -y -i work/music_raw.wav -af "volume=${GM}dB,alimiter=limit=0.7:attack=2:release=60:level=disabled" -ar 48000 work/music.wav
if python3 -c "import json,sys;sys.exit(0 if 'voice' in json.load(open('out/timing.json')) else 1)"; then
  python3 src/voice.py
  GV=$(python3 -c "print(round(-15.2-($(lufs work/voice_raw.wav)),2))")
  # voice at about -16 LUFS on top; the music ducks under it (side-chain) and comes back in the gaps
  ffmpeg -v error -y -i work/music.wav -i work/voice_raw.wav -filter_complex \
   "[1:a]volume=${GV}dB,highpass=f=70,alimiter=limit=0.89:attack=2:release=50:level=disabled,aformat=channel_layouts=stereo,asplit=2[v][key];[0:a][key]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=420:makeup=1[m];[m][v]amix=inputs=2:normalize=0,alimiter=limit=0.94:attack=2:release=50:level=disabled[a]" \
   -map "[a]" -ar 48000 work/mix.wav
  echo "voice gain ${GV} dB, music gain ${GM} dB"
else
  cp work/music.wav work/mix.wav; echo "no voice in timing.json: music only (gain ${GM} dB)"
fi
ffmpeg -v error -y -i work/video.mp4 -i work/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/saberium-reel-puerta.mp4
ffmpeg -v error -y -i out/saberium-reel-puerta.mp4 -vf "fps=1/1.3,scale=300:-1,tile=9x4:padding=6:margin=6:color=0x04051C" -frames:v 1 -q:v 3 out/contact-sheet.jpg
ls -la out
