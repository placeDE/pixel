# Place DE pixel data

This repository tracks the current goals of the r/de place community.

Requires pillow, which can be installed using pip: `pip install pillow`

There are two steps using the approriate scripts:

```
config.toml -> pixel.json (-> output.png)
```

The config.toml contains information of where each structure is located and the corresponding image, which is used for the pixel values. This image has to be in the correct scale, that means not scaled up.

To generate the pixel.json run 

```bash
python generate_json.py
```

The format to add or change an entry in the config.toml (add as many blocks as you need):

```toml
[[structure]]
name = "maus"
file = "maus.png"
startx = 58
starty = 832
priority = 1
```

If you want to filter certain colors, e.g. as a mask, you can add them to the `ignore_colors`. These are matched to the exact RGB values in the image, if a contains an ignored color it is skipped.

(Optional) If you want to render the pixel.json into an image to confirm your configuration:

```bash
python render_json.py
```
