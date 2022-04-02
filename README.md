# Place DE pixel data

To generate the pixel.json run 

```bash
python write_data.py pixel.json
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
