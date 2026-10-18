#!/usr/bin/env python3
"""Apply NEXORA launcher icons to a generated Capacitor Android project."""
from __future__ import annotations

import argparse
from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover - CI setup installs Pillow
    print("Pillow is required: python -m pip install Pillow", file=sys.stderr)
    raise SystemExit(2) from exc


def fit_logo(source: Image.Image, size: int, background=(7, 9, 13, 255), inset=0.13) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    image = source.convert("RGBA")
    max_side = max(1, int(size * (1 - 2 * inset)))
    image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    x = (size - image.width) // 2
    y = (size - image.height) // 2
    canvas.alpha_composite(image, (x, y))
    return canvas


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--android-dir", required=True, type=Path)
    parser.add_argument("--logo", required=True, type=Path)
    args = parser.parse_args()

    res = args.android_dir / "app" / "src" / "main" / "res"
    if not (args.android_dir / "app" / "build.gradle").exists():
        raise SystemExit(f"Android app project not found under {args.android_dir}")
    if not args.logo.exists():
        raise SystemExit(f"NEXORA logo not found: {args.logo}")

    original = Image.open(args.logo).convert("RGBA")
    density_sizes = {"mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96,
                     "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192}
    for folder, size in density_sizes.items():
        out_dir = res / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        icon = fit_logo(original, size, inset=0.07)
        icon.save(out_dir / "ic_launcher.png", optimize=True)
        icon.save(out_dir / "ic_launcher_round.png", optimize=True)

    foreground_dir = res / "mipmap-xxxhdpi"
    foreground = fit_logo(original, 432, background=(0, 0, 0, 0), inset=0.16)
    foreground.save(foreground_dir / "ic_launcher_foreground.png", optimize=True)

    adaptive_dir = res / "mipmap-anydpi-v26"
    adaptive_dir.mkdir(parents=True, exist_ok=True)
    adaptive_xml = '''<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/nexora_launcher_background" />\n    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n</adaptive-icon>\n'''
    (adaptive_dir / "ic_launcher.xml").write_text(adaptive_xml, encoding="utf-8")
    (adaptive_dir / "ic_launcher_round.xml").write_text(adaptive_xml, encoding="utf-8")

    values = res / "values"
    values.mkdir(parents=True, exist_ok=True)
    colors_file = values / "colors.xml"
    if colors_file.exists():
        content = colors_file.read_text(encoding="utf-8")
        if "nexora_launcher_background" not in content:
            content = content.replace("</resources>", '    <color name="nexora_launcher_background">#07090D</color>\n</resources>')
        colors_file.write_text(content, encoding="utf-8")
    else:
        colors_file.write_text('''<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="nexora_launcher_background">#07090D</color>\n</resources>\n''', encoding="utf-8")

    print("Applied NEXORA launcher icons.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
