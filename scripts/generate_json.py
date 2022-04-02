import argparse
import pathlib
import json
import toml
from PIL import Image

COLOR_MAPPINGS = {
	'#FF4500': 2,
	'#FFA800': 3,
	'#FFD635': 4,
	'#00A368': 6,
	'#7EED56': 8,
	'#2450A4': 12,
	'#3690EA': 13,
	'#51E9F4': 14,
	'#811E9F': 18,
	'#B44AC0': 19,
	'#FF99AA': 23,
	'#9C6926': 25,
	'#000000': 27,
	'#898D90': 29,
	'#D4D7D9': 30,
	'#FFFFFF': 31
}

def hex_to_col(hex_str, alpha=0xff):
    assert hex_str[0] == "#" and len(hex_str) == 7
    def conv(s):
        return int(s, 16)
    return (conv(hex_str[1:3]), conv(hex_str[3:5]), conv(hex_str[5:7]), alpha)

colors = {}
for hex_str, index in COLOR_MAPPINGS.items():
    colors[hex_to_col(hex_str)] = index

def find_closest_index(color):
    def dist(col1, col2):
        return (col1[0] - col2[0])**2 + (col1[1] - col2[1])**2 + (col1[2] - col2[2])**2
    closest = list(colors.keys())[0]
    val = dist(color, closest)
    for key in colors.keys():
        d = dist(color, key)
        if d < val:
            val = d
            closest = key
    return colors[closest]

def create_structure(image, startx, starty, priority, ignore_colors):
    pixels = []
    with Image.open(image) as img:
        for x in range(img.size[0]):
            for y in range(img.size[1]):
                color = img.getpixel((x, y))
                if color in ignore_colors:
                    continue
                pixels.append({
                    "x": startx + x,
                    "y": starty + y,
                    "color": find_closest_index(color),
                    "priority": priority,
                })
    return {
            "priority": priority,
            "pixels": pixels,
            }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=pathlib.Path, default="config.toml")
    parser.add_argument("output", nargs="?", default="pixel.json")
    args = parser.parse_args()

    config = toml.load(args.config)
    ignore_colors = list(map(tuple, config["ignore_colors"]))
    version = config["version"]

    data = {
        "version": version,
        "structures": {},
        "priorities": config["priorities"],
    }
    for struct in config["structure"]:
        file = struct["file"]
        name = struct["name"]
        print(f"Adding file {file} for structure {name}")
        data["structures"][name] = create_structure(file, struct["startx"], struct["starty"], struct["priority"], ignore_colors)
    
    with open(args.output, "w") as f:
        f.write(json.dumps(data, indent=4))
