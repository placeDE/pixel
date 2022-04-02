from PIL import Image

offset_x = 1
offset_y = 1
pick_offset_x = 3
pick_offset_y = 3
pixel_width = 30
pixel_height = 29

def create_pixelart(image):
    with Image.open(image) as img:
        dimensions = (int((img.size[0] - offset_x) / pixel_width), int((img.size[1] - offset_y) / pixel_height))
        image_out = Image.new("RGBA", dimensions, "#00000000")
        for x in range(dimensions[0]):
            for y in range(dimensions[1]):
                color = img.getpixel((x * pixel_width + pick_offset_x, y * pixel_height + pick_offset_y))
                image_out.putpixel((x, y), color)
        image_out.save("output.png")


if __name__ == '__main__':
    create_pixelart("../raw.png")

