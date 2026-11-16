#!/usr/bin/env python3
"""Build an overlapped Deep Zoom Image pyramid from the harmonized 3 m master."""

from math import ceil, log2
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/road-zoom-pilot/road-composite-3m-harmonized.png"
OUTPUT = ROOT / "public/assets/deep-zoom-pilot/road-composite"
TILE_SIZE = 256
OVERLAP = 1
QUALITY = 93


def main():
    image = Image.open(SOURCE).convert("RGB")
    width, height = image.size
    max_level = ceil(log2(max(width, height)))

    for level in range(max_level + 1):
        divisor = 2 ** (max_level - level)
        level_width = ceil(width / divisor)
        level_height = ceil(height / divisor)
        level_image = image if divisor == 1 else image.resize((level_width, level_height), Image.Resampling.LANCZOS)
        level_dir = OUTPUT.parent / f"{OUTPUT.name}_files" / str(level)
        level_dir.mkdir(parents=True, exist_ok=True)
        cols = ceil(level_width / TILE_SIZE)
        rows = ceil(level_height / TILE_SIZE)

        for row in range(rows):
            for col in range(cols):
                left = col * TILE_SIZE
                top = row * TILE_SIZE
                right = min(left + TILE_SIZE, level_width)
                bottom = min(top + TILE_SIZE, level_height)
                if col > 0:
                    left -= OVERLAP
                if row > 0:
                    top -= OVERLAP
                if col < cols - 1:
                    right += OVERLAP
                if row < rows - 1:
                    bottom += OVERLAP
                level_image.crop((left, top, right, bottom)).save(
                    level_dir / f"{col}_{row}.jpg", "JPEG", quality=QUALITY, optimize=True
                )

    root = ET.Element("Image", {
        "xmlns": "http://schemas.microsoft.com/deepzoom/2008",
        "Format": "jpg",
        "Overlap": str(OVERLAP),
        "TileSize": str(TILE_SIZE),
    })
    ET.SubElement(root, "Size", {"Width": str(width), "Height": str(height)})
    ET.ElementTree(root).write(OUTPUT.with_suffix(".dzi"), encoding="UTF-8", xml_declaration=True)
    print(f"Generated {OUTPUT.with_suffix('.dzi')} with levels 0–{max_level} ({width}×{height})")


if __name__ == "__main__":
    main()
