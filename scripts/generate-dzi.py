#!/usr/bin/env python3
"""Build an overlapped Deep Zoom Image pyramid from a square image master."""

import argparse
from math import ceil, log2
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "public/assets/road-zoom-pilot/road-composite-3m-harmonized.png"
DEFAULT_OUTPUT = ROOT / "public/assets/deep-zoom-pilot/road-composite"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="source image master")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="output prefix for the .dzi and tile directory")
    parser.add_argument("--tile-size", type=int, default=256)
    parser.add_argument("--overlap", type=int, default=1)
    parser.add_argument("--quality", type=int, default=93)
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGB")
    width, height = image.size
    max_level = ceil(log2(max(width, height)))

    for level in range(max_level + 1):
        divisor = 2 ** (max_level - level)
        level_width = ceil(width / divisor)
        level_height = ceil(height / divisor)
        level_image = image if divisor == 1 else image.resize((level_width, level_height), Image.Resampling.LANCZOS)
        level_dir = args.output.parent / f"{args.output.name}_files" / str(level)
        level_dir.mkdir(parents=True, exist_ok=True)
        cols = ceil(level_width / args.tile_size)
        rows = ceil(level_height / args.tile_size)

        for row in range(rows):
            for col in range(cols):
                left = col * args.tile_size
                top = row * args.tile_size
                right = min(left + args.tile_size, level_width)
                bottom = min(top + args.tile_size, level_height)
                if col > 0:
                    left -= args.overlap
                if row > 0:
                    top -= args.overlap
                if col < cols - 1:
                    right += args.overlap
                if row < rows - 1:
                    bottom += args.overlap
                level_image.crop((left, top, right, bottom)).save(
                    level_dir / f"{col}_{row}.jpg", "JPEG", quality=args.quality, optimize=True
                )

    root = ET.Element("Image", {
        "xmlns": "http://schemas.microsoft.com/deepzoom/2008",
        "Format": "jpg",
        "Overlap": str(args.overlap),
        "TileSize": str(args.tile_size),
    })
    ET.SubElement(root, "Size", {"Width": str(width), "Height": str(height)})
    output_dzi = args.output.with_suffix(".dzi")
    output_dzi.parent.mkdir(parents=True, exist_ok=True)
    ET.ElementTree(root).write(output_dzi, encoding="UTF-8", xml_declaration=True)
    print(f"Generated {output_dzi} with levels 0–{max_level} ({width}×{height})")


if __name__ == "__main__":
    main()
