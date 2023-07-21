"""File to generate boards according to the flavours of the catppuccin"""
from catppuccin import Flavour
from boardinator.boardinator import replace_colors

themes = {
    "latte": Flavour.latte(),
    "mocha": Flavour.mocha(),
    "macchiato": Flavour.macchiato(),
    "frappe": Flavour.frappe(),
}

accents = [
    "rosewater",
    "flamingo",
    "pink",
    "mauve",
    "red",
    "maroon",
    "peach",
    "yellow",
    "green",
    "teal",
    "sky",
    "sapphire",
    "blue",
    "lavender",
]


def generate_boards():
    """Generate boards for each flavour of catppuccin"""
    for flavour, theme in themes.items():
        for accent in accents:
            color_dict = {
                (237, 238, 209): (
                    theme.base.red,
                    theme.base.green,
                    theme.base.blue,
                ),  # the Light Grayish Yellow Green
                (119, 153, 82): (
                    getattr(theme, accent).red,
                    getattr(theme, accent).green,
                    getattr(theme, accent).blue,
                ),  # the Dark Grayish Yellow Green
            }
            replace_colors(
                image_path="assets/base/colorboard.png",
                output_path=f"assets/{flavour}/{accent}.png",
                color_dict=color_dict,
            )


if __name__ == "__main__":
    generate_boards()
