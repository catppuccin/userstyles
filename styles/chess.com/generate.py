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
        color_dict = {
            # Light grayish yellow green
            (237, 238, 209): (
                flavor.colors.base.rgb.r,
                flavor.colors.base.rgb.g,
                flavor.colors.base.rgb.b,
            ),
            # Dark grayish yellow green
            (119, 153, 82): (
                color.rgb.r,
                color.rgb.g,
                color.rgb.b,
            ),
        }
        replace_colors(
            image_path=f"{cwd}/assets/base/colorboard.png",
            output_path=f"{cwd}/assets/{flavor.identifier}/{color.identifier}.png",
            color_dict=color_dict,
        )
