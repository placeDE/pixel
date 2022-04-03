## Einführung neuer Bilder
**1. Branch erstellen**


**2. Bild in Images-Ordner hinzufügen mit Dateiname:** 
_beispiel.png_ mit transparentem Hintergrund und keinem leeren Rand.\
Das Bild muss 1:1 das Pixelart sein nur aus den vorgegebenen Farben von Reddit bestehen


**3. in config.toml neuen Block hinzufügen:** 
```toml
[[structure]]
name = "beispiel"
file = "images/beispiel.png"
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


## Scripts

For running the script see the README.md in scripts/
