#!/usr/bin/env bash
set -euo pipefail

PALETTE_FILE="/tmp/cli-izdat-palette.png"

magick \
  -size 1x1 xc:"#4a4a46" \
  -size 1x1 xc:"#f5f0e6" \
  -size 1x1 xc:"#8a8a84" \
  +append \
  "$PALETTE_FILE"

for src in "$@"; do
  [ -f "$src" ] || { echo "✗ not found: $src"; continue; }
  base="${src%.*}"
  out="${base}.dithered.webp"
  magick "$src" \
    -auto-orient \
    -ordered-dither o4x4 \
    -remap "$PALETTE_FILE" \
    -define webp:lossless=true \
    "$out"
  echo "✓ $src → $out"
done

rm -f "$PALETTE_FILE"
