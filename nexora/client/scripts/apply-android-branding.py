#!/usr/bin/env python3
"""Apply NEXORA launcher and native splash-screen branding to Capacitor Android."""
from __future__ import annotations

import argparse
import re
from pathlib import Path
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:  # pragma: no cover - CI setup installs Pillow
    print("Pillow is required: python -m pip install Pillow", file=sys.stderr)
    raise SystemExit(2) from exc

DARK = (7, 9, 13, 255)
DARK_HEX = "#07090D"


def fit_logo(source: Image.Image, size: int, background=DARK, inset=0.13) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background)
    image = source.convert("RGBA")
    max_side = max(1, int(size * (1 - 2 * inset)))
    scale = min(max_side / image.width, max_side / image.height)
    width = max(1, int(round(image.width * scale)))
    height = max(1, int(round(image.height * scale)))
    image = image.resize((width, height), Image.Resampling.LANCZOS)
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

    # The original NEXORA logo is used without redrawing it. Android's native
    # splash displays it on the same near-black background as the app theme.
    drawable_dir = res / "drawable"
    drawable_dir.mkdir(parents=True, exist_ok=True)
    splash = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    logo_layer = original.copy()
    logo_layer.thumbnail((420, 330), Image.Resampling.LANCZOS)
    splash.alpha_composite(logo_layer, ((512 - logo_layer.width) // 2, 28 + (330 - logo_layer.height) // 2))
    draw = ImageDraw.Draw(splash)
    font = None
    for font_path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    ):
        try:
            font = ImageFont.truetype(font_path, 23)
            break
        except OSError:
            pass
    if font is None:
        font = ImageFont.load_default()
    motto = "CONNECT. GROW. EARN."
    bounds = draw.textbbox((0, 0), motto, font=font, stroke_width=0)
    text_width = bounds[2] - bounds[0]
    draw.text(((512 - text_width) // 2, 412), motto, font=font, fill=(245, 247, 255, 255))
    splash.save(drawable_dir / "splash.png", optimize=True)

    foreground_sizes = {"mipmap-mdpi": 108, "mipmap-hdpi": 162, "mipmap-xhdpi": 216,
                        "mipmap-xxhdpi": 324, "mipmap-xxxhdpi": 432}
    for folder, size in foreground_sizes.items():
        foreground_dir = res / folder
        foreground_dir.mkdir(parents=True, exist_ok=True)
        foreground = fit_logo(original, size, background=(0, 0, 0, 0), inset=0.05)
        foreground.save(foreground_dir / "ic_launcher_foreground.png", optimize=True)

    adaptive_dir = res / "mipmap-anydpi-v26"
    adaptive_dir.mkdir(parents=True, exist_ok=True)
    adaptive_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/nexora_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
'''
    (adaptive_dir / "ic_launcher.xml").write_text(adaptive_xml, encoding="utf-8")
    (adaptive_dir / "ic_launcher_round.xml").write_text(adaptive_xml, encoding="utf-8")

    values = res / "values"
    values.mkdir(parents=True, exist_ok=True)
    colors_file = values / "colors.xml"
    if colors_file.exists():
        content = colors_file.read_text(encoding="utf-8")
        color_line = f'    <color name="nexora_launcher_background">{DARK_HEX}</color>'
        if "nexora_launcher_background" in content:
            content = re.sub(
                r'<color\s+name=["\']nexora_launcher_background["\'][^>]*>.*?</color>',
                color_line,
                content,
            )
        else:
            content = content.replace("</resources>", color_line + "\n</resources>")
        colors_file.write_text(content, encoding="utf-8")
    else:
        colors_file.write_text(
            f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
            f'    <color name="nexora_launcher_background">{DARK_HEX}</color>\n'
            '</resources>\n',
            encoding="utf-8",
        )

    styles_file = values / "styles.xml"
    if styles_file.exists():
        styles_text = styles_file.read_text(encoding="utf-8")
        launch_style = re.search(
            r"(<style\s+name=['\"]AppTheme\.NoActionBarLaunch['\"][^>]*>)(.*?)(</style>)",
            styles_text,
            flags=re.DOTALL,
        )
        if launch_style:
            body = launch_style.group(2)
            items = {
                "windowSplashScreenAnimatedIcon": "@drawable/splash",
                "windowSplashScreenBackground": DARK_HEX,
                "android:background": DARK_HEX,
            }
            for name, value in items.items():
                pattern = rf'<item\s+name=["\']{re.escape(name)}["\'][^>]*>.*?</item>'
                line = f'<item name="{name}">{value}</item>'
                if re.search(pattern, body):
                    body = re.sub(pattern, line, body)
                else:
                    body += "\n        " + line
            styles_text = styles_text[:launch_style.start(2)] + body + styles_text[launch_style.end(2):]
            styles_file.write_text(styles_text, encoding="utf-8")

    # Android 12+ draws this system splash before the webview is available.
    v31_values = res / "values-v31"
    v31_values.mkdir(parents=True, exist_ok=True)
    (v31_values / "styles.xml").write_text(
        '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">#07090D</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splash</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
''',
        encoding="utf-8",
    )

    print("Applied NEXORA launcher icons and dark native splash logo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
