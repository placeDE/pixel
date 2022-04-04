## Einführung neuer Bilder
**1. Branch erstellen**


**2. Bild in Images-Ordner hinzufügen mit Dateiname:** 
_beispiel.png_ mit transparentem Hintergrund und keinem leeren Rand.\
Das Bild muss 1:1 das Pixelart sein nur aus den vorgegebenen Farben von Reddit bestehen


**3. in config.toml neuen Block hinzufügen:** 
```toml
[[structure]]
name = "beispiel"
file = "images/art/beispiel.png"
# optional: priority_file = "images/priorities/beispiel-priority.png"
startx = 1234 #x-Koordinate
starty = 5678 #y-Koordinate
priority = 2
```
Dabei bezeichnet die Koordinate das oberste linke Pixel der verlinkten png in r/place
und Priority bitte **NICHT** ändern, außer es ist mit dem Rest der Devs abgesprochen.

**4. Scripte ausführen zur Vorschau des Outputs:**
Zwei Skripte in der angegebenen Reihenfolge aus dem Hauptordner des Repos ausführen\
`python .\scripts\generate_json.py`\
Damit sollte eine _pixel.json_ generiert werden\
`python .\scripts\render_json.py`\
Nun wird aus der _pixel.json_ eine _output.png_ und eine _overlay.png_ generiert\

WICHTIG: In der _output.png_ gucken, dass die Bilder richtig platziert wurden und evtl. das eigenen Overlay mit der neuen _overlay.png_ testen, ob z. B. bei einer Änderung eines alten Bildes die Koordinaten nicht versetzt zum alten Bild sind.

**5. Änderungen Committen und pushen** 
Betroffene Dateien sind:\
_config.toml_, und _images\beispiel.png_\
NICHT _pixel.json_, _output.png_ oder _overlay.png_ pushen, das verursacht Merge-Conflicts wenn mehrere Personen Bilder hinzufügen und wird von GitHub-Actions im **main** übernommen

**6. Pull Request zum main stellen und von anderem Dev prüfen lassen** 

**7. Beten, dass die Actions funktionieren und weinen, wenn sie es nicht tun**


## Adding new images
**1. Create a branch**


**2. Upload image to images folder:** 
_example.png_ with transparent background and without any border.\
The image must be in 1:1 pixel scale and only use the colours provided by reddit.


**3. Add a new block to config.toml:** 
```toml
[[structure]]
name = "example"
file = "images/example.png"
startx = 1234 # x-coordinate
starty = 5678 # y-coordinate
priority = 2
```
The coordinates are of the uppermost, leftmost pixel of the linked png in r/place.
Do not change the priority unless coordinated with the other devs.

**4. Run scripts to preview output:**
Run these two scrips in this specific order
```bash
python .\scripts\generate_json.py
```
This will generate _pixel.json_
```bash
python .\scripts\render_json.py
```
Now _pixel.json_ is used to generate _output.png_ as well as _overlay.png_.

**IMPORTANT:** Check _output.png_ to ensure the images have been placed correctly.
You can also use _overlay.png_ to check if the overlay is correct.


**5. Commit and push your changes** 
Relevant files are:

_config.toml_, and _images\beispiel.png_

**DO NOT** push _pixel.json_, _output.png_ or _overlay.png_.

These files will conflict when multiple people are adding files at the same time.
GitHub-Actions will automatically build the output and overlay once your pull request
has been accepted.

**6. Create a pull request to main and have another dev review it** 

**7. Pray the actions work and cry if they don't**

## Scripts

For running the script see the README.md in scripts/
