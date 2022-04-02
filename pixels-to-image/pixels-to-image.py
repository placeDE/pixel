from ctypes.wintypes import RGB
from os import mkdir
from pathlib import Path
import sys
import json5
from PIL import Image, ImageDraw

colors = {
    2: "#FF4500",
	3:"#FFA800",
	4: "#FFD635",
	6: "#00A368",
	8: "#7EED56",
	12: "#2450A4",
	13: "#3690EA",
	14: "#51E9F4",
	18: "#811E9F",
	19: "#B44AC0",
	23: "#FF99AA",
	25: "#9C6926",
	27: "#000000",
	29: "#898D90",
	30: "#D4D7D9",
	31: "#FFFFFF"
}

Path("out/").mkdir(exist_ok=True)

pixel_file = open("../pixel.json")
pixel = json5.load(pixel_file)
structures = pixel["structures"]

print(f"Found {len(structures)} structures.")

for structure_id, structure in structures.items():
    print(f"Processing {structure_id}.")

    pixels = structure["pixels"]
    print(f"Found {len(pixels)} pixels.")

    x_max = max([pixel["x"] for pixel in pixels])
    y_max = max([pixel["y"] for pixel in pixels])

    width = x_max + 1
    height = y_max + 1

    print(f"Width = {width}, Height = {height}")
    image = Image.new(mode="RGB", size=(x_max + 1, y_max + 1))
    draw = ImageDraw.Draw(image)

    for pixel in pixels:
        x = pixel["x"]
        y = pixel["y"]
        color_id = pixel["color"]

        if (not (color_id in colors)):
            print(f"Unknown color ID {color_id} at x = {x}, y = {y}")
            sys.exit(1)

        draw.point((x, y), colors[color_id])

    file_name = f"./out/{structure_id}.png" 
    image.save(file_name)
    print(f"Saved to {file_name}")
