# Entwicklung

## Projektstruktur

| Datei / Ordner | Aufgabe |
| --- | --- |
| `app.js` | Three.js-Szene, Telemetrieabfragen und Bedienung |
| `data.js` | Missionsadapter, Archivdekodierung und Geschwindigkeitsberechnung |
| `i18n.js` | Texte in sechs Sprachen |
| `index.template.html` | Oberfläche und Styles vor dem Build |
| `update-check.js` | Versionsprüfung und kontrolliertes Neuladen |
| `build.mjs` | Bündelt JavaScript, Schriften und Texturen in eine HTML-Datei |
| `assets/` | Texturen, Schriften, Lizenztexte und eingebettete Daten |
| `data.test.js` | Tests für Datenverarbeitung und Missionsauswahl |
| `update-check.test.js` | Tests für Updates, Offline-Fälle und Reload-Verhalten |
| `index.html` / `version.json` | Auslieferbarer Build und Versionskennung |
| `tools/` | Skripte für die bestehende AI-Radio-Pi-Infrastruktur |

## Arbeitsablauf

```sh
npm ci
npm test
npm run build
npm start
```

Die Oberfläche ist unter http://localhost:8080 erreichbar. Änderungen an der Vorlage oder den Quelldateien werden erst nach `npm run build` sichtbar. Die Versionskennung wird deterministisch aus Quellen und Assets berechnet. `index.html` und `version.json` werden gemeinsam versioniert, damit das Repository direkt ausführbar bleibt.

Nach UI-Änderungen zusätzlich Rotation, Zoom, Missionswechsel und Sprachwechsel im Browser prüfen. Touch-Bedienung und kleine Bildschirmhöhen separat ansehen.

## Weitere Missionen anbinden

`TRAJECTORY_SOURCES` in `data.js` ist die ausdrückliche Freigabeliste für Missions-Telemetrie. Ein Start im Missionskatalog allein aktiviert keine Flugbahn. Neue Quellen benötigen einen passenden Adapter und gültige Messzeitstempel, Koordinaten sowie Höhen. Fehlende Daten müssen weiterhin als fehlend erkennbar bleiben.

Messdaten, Feed-Prognosen und illustrative Schemapunkte getrennt halten. Schema-Koordinaten dürfen niemals in gemessene Verläufe oder Geschwindigkeitsberechnungen einfließen. Änderungen an der Datenverarbeitung mit den vorhandenen Node-Tests prüfen und bei neuem Verhalten passende Testfälle ergänzen.

## Bereitstellung

Für einen eigenen statischen Server genügen der gebaute `index.html`, `version.json` und die Lizenztexte inklusive der referenzierten Asset-Lizenzen. HTML und Versionsdatei sollten ohne Browsercache ausgeliefert werden. Die Versionsdatei erst nach dem zugehörigen HTML veröffentlichen.

`tools/deploy-pi.py` und `tools/fix-pi-cache.py` sind auf die bestehende AI-Radio-Installation zugeschnitten: SSH-Alias `pi4`, vorhandener Webdienst und ein vorbereitetes benachbartes Karussell-Projekt werden vorausgesetzt. Das Deployment verändert ORBIT und das Karussell auf diesem Server. Diese Skripte sind kein allgemeiner Installationsassistent. Der genaue Betrieb ist im [Handbuch](handbuch.md) dokumentiert.
