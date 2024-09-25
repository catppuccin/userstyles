#!/usr/bin/env uv run
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "boardinator==0.1.0",
#     "catppuccin==2.1.0",
# ]
# ///
from os import path
from catppuccin import PALETTE
from boardinator.boardinator import replace_colors

cwd = path.normpath(path.dirname(__file__))

for flavor in PALETTE:
    for color in flavor.colors:
        if not color.accent:
            continue

        # Chess.com default board colors
        chess_com_base_color = (237, 238, 209)
        chess_com_accent_color = (119, 153, 82)

        base_color = (
            flavor.colors.base.rgb.r,
            flavor.colors.base.rgb.g,
            flavor.colors.base.rgb.b,
        )
        accent_color = (
            color.rgb.r,
            color.rgb.g,
            color.rgb.b,
        )

        if flavor.dark:
            accent_color, base_color = base_color, accent_color

        color_dict = {
            chess_com_base_color: base_color,
            chess_com_accent_color: accent_color,
        }
        replace_colors(
            image_path=f"{cwd}/assets/base/colorboard.png",
            output_path=f"{cwd}/assets/{flavor.identifier}/{color.identifier}.png",
            color_dict=color_dict,
        )
