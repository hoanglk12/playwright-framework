#!/bin/bash
# scripts/upscale-videos.sh
for video in test-results/*.webm; do
  ffmpeg -i "$video" -vf "scale=1920:1080" -c:v libvpx-vp9 -b:v 2M "${video%.*}_hd.webm"
done