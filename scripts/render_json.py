from PIL import Image
import argparse
import pathlib
import json

WIDTH = 1000
HEIGHT = 1000

colors = {
    2: (0xFF, 0x45, 0x00, 0xFF),
    3: (0xFF, 0xA8, 0x00, 0xFF),
    4: (0xFF, 0xD6, 0x35, 0xFF),
    6: (0x00, 0xA3, 0x68, 0xFF),
    8: (0x7E, 0xED, 0x56, 0xFF),
    12: (0x24, 0x50, 0xA4, 0xFF),
    13: (0x36, 0x90, 0xEA, 0xFF),
    14: (0x51, 0xE9, 0xF4, 0xFF),
    18: (0x81, 0x1E, 0x9F, 0xFF),
    19: (0xB4, 0x4A, 0xC0, 0xFF),
    23: (0xFF, 0x99, 0xAA, 0xFF),
    25: (0x9C, 0x69, 0x26, 0xFF),
    27: (0x00, 0x00, 0x00, 0xFF),
    29: (0x89, 0x8D, 0x90, 0xFF),
    30: (0xD4, 0xD7, 0xD9, 0xFF),
    31: (0xFF, 0xFF, 0xFF, 0xFF),
}

def hex_to_col(hex_str, alpha=0xff):
    assert hex_str[0] == "#" and len(hex_str) == 7
    def conv(s):
        return int(s, 16)
    return (conv(hex_str[1:3]), conv(hex_str[3:5]), conv(hex_str[5:7]))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="*", type=pathlib.Path, default=["pixel.json"])
    args = parser.parse_args()

    img = Image.new("RGBA", (WIDTH, HEIGHT), "#00000000")

    for file in args.files:
        with open(file) as f:
            data = json.loads(f.read())
        for name, part in data["structures"].items():
            print(f"rendering {name}")
            pixels = part["pixels"]
            for pixel in pixels:
                x = pixel["x"]
                y = pixel["y"]
                color_index = pixel["color"]
                if type(color_index) is str:
                    color = hex_to_col(color_index)
                    print(f"converted {color_index} to {color}")
                else:
                    color = colors[color_index]
                img.putpixel((x, y), color)
    img.save("output.png")
