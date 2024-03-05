from catppuccin import PALETTE
from boardinator.boardinator import replace_colors


def generate_boards():
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
                image_path="../../assets/base/colorboard.png",
                output_path=f"../../assets/{flavor.identifier}/{color.identifier}.png",
                color_dict=color_dict,
            )
