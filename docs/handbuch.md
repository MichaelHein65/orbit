# ORBIT · Bedienung und technischer Betrieb

## Öffnen

Die fertige **index.html** ist eine einzelne Datei mit eingebetteter 3D-Bibliothek, Schriften und Erdtexturen. Sie lässt sich direkt im aktuellen Chromium, Chrome oder Firefox öffnen. Für einen zuverlässigen Betrieb empfiehlt sich ein kleiner Webserver:

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Anschließend auf dem gleichen Gerät http://localhost:8080 öffnen. Im Heimnetz: http://IP-DES-PI:8080. Der Server stellt den gesamten aktuellen Ordner bereit; auf dem Pi deshalb einen eigenen Ordner nur mit index.html verwenden.

## Raspberry Pi 4

1. `index.html` in einen eigenen Ordner auf den Pi kopieren. Node.js und npm werden dort nicht benötigt.
2. Den Webserver wie oben in diesem Ordner starten.
3. Chromium öffnen und die Seite aufrufen. Die Grafik läuft dauerhaft in hoher Qualität: maximal zweifache Pixeldichte und bis zu 60 FPS.
4. Optional den Browser im Kioskmodus öffnen: `chromium --kiosk http://localhost:8080` (je nach Raspberry Pi OS heißt das Programm `chromium-browser`).

Die tatsächliche Leistung hängt von Bildschirmauflösung, Raspberry Pi OS und aktivierter WebGL-Hardwarebeschleunigung ab. Die Seite wurde im Desktop-Browser geprüft, nicht auf einem physischen Pi 4.

## Bedienung

- Das Stelen-Symbol neben dem Radio-Link führt zurück zum App-Karussell unter https://ai-radio.cc/karussell/ .
- Der kleine Tiger-Hero-Kopf neben ORBIT öffnet https://ai-radio.cc/ in einem neuen Tab. Der Linktext und die barrierefreie Beschriftung wechseln mit der Sprache. Das vorhandene Radio-Motiv ist lokal in die HTML-Datei eingebettet.

- Ziehen: frei drehen; Mausrad oder Pinch: zoomen.
- Im mobilen Layout reichen die leeren Flächen des Infobereichs Touch-Gesten an den Globus durch. Die sichtbaren Informationskarten bleiben bedienbar. Drehen, Pinch-Zoom und Schaltflächen wurden mit emulierter Touch-Eingabe geprüft; ein Test auf einem physischen iPhone steht aus.
- Missionen: Die Auswahl enthält Missionen mit angebundener Flugbahnquelle (derzeit Starship Flight 15) und eine gesonderte Vorschau auf die fünf nächsten geplanten SpaceX-Starts, chronologisch nach Starttermin. Die Vorschau zeigt Startzeit, Rakete, Nutzlast und Startplatz auf dem Globus. Ohne angebundene Positionsquelle bleiben Messwerte und Flugbahnen leer; die Vorschau ist ausdrücklich gekennzeichnet. Die Startliste aktualisiert sich höchstens alle 30 Minuten und verwendet offline den gespeicherten beziehungsweise eingebetteten Katalog.
- Sprache: Deutsch, English, Español, Français, 中文（普通话 / Mandarin） und Português. Die Sprache und ausgewählte Mission bleiben im Browser gespeichert.
- Nutzlast oder Booster fokussieren: folgt dem jeweiligen Marker; manuelles Drehen beendet die Verfolgung.
- Booster-Rückblick: gemeinsamer gemessener Aufstieg bis konservativ T+130 s. Die Ship-GPS-Position beschreibt in dieser Phase den noch verbundenen Raketenstapel. Play/Pause und Schieberegler spielen den verfügbaren Abschnitt ab.
- Optional „Schematischen Rückflug ergänzen“: ergänzt einen frei modellierten, orange gestrichelten Rückflug mit der Kennzeichnung **SCHEMA · UNBESTÄTIGT**. Flugkoordinaten, Höhenprofil und Aufsetzpunkt dieses Abschnitts sind nicht verifiziert. Er dient nur der Veranschaulichung. Der Regler zeigt Animationsfortschritt, keine reale Zeit. Schema-Punkte fließen niemals in gemessene Verläufe oder Geschwindigkeitsberechnungen ein.
- Bisherige Flugbahn: lässt sich ein- und ausblenden. Bei kleiner Bildschirmhöhe ist der linke Informationsbereich scrollbar.
- Bahnüberhöhung: reale Höhe über der Kugel um Faktor 1–16 überhöhen. Die Zahlenwerte bleiben unverändert.
- Koordinatennetz, Auto-Rotation und Vollbild sind umschaltbar. Die Grafikqualität bleibt dauerhaft auf Hoch.
- Flugvorschau: ausdrücklich illustrative Beispielbahnen von Ship und Booster, keine Aufzeichnung. Zurück zu Live wechselt wieder zu echten Quelldaten.

## Daten und Grenzen

- Die Seite fragt https://stardash.live/api/feed alle fünf Sekunden ab. Dies ist ein öffentlicher Drittanbieter-Feed ohne Verfügbarkeitsgarantie und mit veränderlichem Schema. CORS wird aktuell unterstützt. Zusätzlich werden das öffentliche Flugarchiv von StarDash und die Startliste der Launch Library 2 abgerufen. Die Darstellung selbst funktioniert offline.
- Ship 42 wird anhand von `lat`, `lon`, `alt` (Meter) und `wall` (Unixzeit) dargestellt. Fehlende oder mit null gemeldete Geschwindigkeit wird aus zwei gültigen Positions-/Höhenmessungen im Abstand von 5 bis 120 Sekunden berechnet. Dafür werden WGS84-Koordinaten in ein erdfestes kartesisches Bezugssystem umgerechnet und räumliche Distanz durch Messzeit geteilt. GPS-Zeitstempel haben Vorrang vor Empfangszeiten. Die Anzeige ist eine mittlere erdbezogene Geschwindigkeit, gekennzeichnet als „berechnet · erdbezogen“. Lücken, unplausible Sprünge oder fehlende Messpaare ergeben weiterhin „nicht gemeldet“.
- Durchgezogen (Türkis): bisher verfügbare gemessene Nutzlastbahn ab Start. StarDash `/api/history` und stündliche Archivblöcke liefern den Verlauf auch vor dem Öffnen der Seite; bis zu 48 Stunden werden nachgeladen. Lokale Messungen werden pro Mission gespeichert. Abstände über zehn Minuten werden als Lücken dargestellt. Gestrichelt (Türkis): `traj`-Prognose aus dem Feed. Orange durchgezogen: gemeinsamer gemessener Booster-Aufstieg oder vorhandene Booster-Messdaten. Orange gestrichelt: ausschließlich optionales unbestätigtes Rückflugschema.
- Ab 30 Sekunden alten Daten oder bei Verbindungsproblemen zeigt die Seite ausdrücklich den letzten Datenstand statt „Live“. Sie extrapoliert keine Messpositionen.
- Für Booster 22 enthält der Feed keine eigenen verifizierten Positionsdaten nach der Stufentrennung. Sein Rückblick verwendet nur den gemeinsamen Aufstieg als Messdaten; das optionale Rückflugschema ist keine historische GPS-Aufzeichnung. Sein Marker ist ausdrücklich als Rückblick oder unbestätigtes Schema markiert. Der Startplatz ist kein aktueller Booster-Standort.
- Für weitere Missionen sind getrennte Nutzlast- und Booster-Felder vorbereitet. `TRAJECTORY_SOURCES` in `data.js` ist die explizite Freigabeliste für Messdaten. Die fünf nächsten geplanten Starts sind zusätzlich als reine Startvorschau auswählbar.
- Tag/Nacht werden aus aktueller UTC-Zeit und angenähertem Sonnenstand berechnet. Erdtexturen sind statische Satellitenmosaike, keine aktuellen Wetterbilder.
- Wird der Browser-Tab verborgen, pausieren Rendering und reguläre Datenabfragen.

## Quellcode ändern

`app.js`: Globus, Telemetrie und Bedienung. `data.js`: Missionsadapter, Archivdekodierung und Geschwindigkeit. `i18n.js`: Übersetzungen aller sechs Sprachen. `index.template.html`: Oberfläche. `assets/`: lokale Texturen und Schriftdateien.

```sh
npm ci
npm run build
npm test
```

Das erzeugt wieder die vollständige `index.html` ohne externe Laufzeitbibliotheken.

## Quellen und Lizenzen

- Three.js (MIT): siehe `THIRD-PARTY-LICENSES.txt`.
- Erdtexturen: NASA-Mosaike aus https://github.com/vasturiano/three-globe/tree/master/example/img (three-globe: MIT).
- Barlow Condensed und DM Sans: Google Fonts, SIL Open Font License 1.1; Lizenztexte im Ordner `assets`.
- Telemetrie und Archiv: https://stardash.live/ .
- Missionskatalog: https://thespacedevs.com/llapi .
- Booster-Ereignisse / Missionskontext: https://www.spacex.com/launches/starship-flight-15 ; keine Quelle für die schematischen Rückflugkoordinaten.
- Unabhängiges Projekt, keine offizielle SpaceX-Anwendung.

## Veröffentlichung auf dem Pi 4 · 14.11.2026

- Öffentliche App: https://ai-radio.cc/orbit/ (auch https://www.ai-radio.cc/orbit/).
- App-Galerie: https://ai-radio.cc/karussell/ . ORBIT steht auf Stele 5; eine Songtexte-Stele bleibt auf Position 10 erhalten.
- Dateien: `/home/pi4/web/orbit/`; ausgeliefert vom bestehenden `ai-radio-web.service` auf `127.0.0.1:8080` über den vorhandenen Cloudflare-Tunnel. Der Server bleibt bewusst nur lokal am Pi erreichbar; der externe Zugriff erfolgt über HTTPS auf der Domain.
- Keine zusätzliche Serveranwendung oder Installation auf dem Pi erforderlich. Das 3D-Rendering läuft im Browser des Besuchers.
- `deployment.json` enthält den zuletzt veröffentlichten Release-Namen und Backup-Pfad.
- `python3 tools/deploy-pi.py` veröffentlicht den aktuellen ORBIT-Build und den zuvor mit `npm run build:pi` erstellten Karussell-Build aus dem benachbarten AI-Radio-Projekt. Upload und Veröffentlichung werden durch SHA-256-Prüfsummen kontrolliert; die bisherigen Dateien werden unter `/home/pi4/deploy-backups/` gesichert.


### Safari-Cache

Die Verzeichnis-Einstiege `/karussell/` und `/orbit/` liefern seit der Cache-Korrektur ebenfalls `no-store, no-cache, must-revalidate, max-age=0`. `tools/fix-pi-cache.py` dokumentiert die eng begrenzte Änderung am vorhandenen Webserver und prüft neun Routen. Für bereits gespeicherte alte Safari-Einstiege: https://ai-radio.cc/karussell/?v=orbit-20261114-safari .


## Automatische Aktualisierung

ORBIT und Karussell enthalten eine Versionsprüfung. Die Builds erzeugen jeweils `version.json` mit einer aus den Quellen berechneten Versionskennung. HTML-Einstiege und Versionsdateien werden mit `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` ausgeliefert. Die Versionsabfragen verwenden zusätzlich `cache: no-store` und einen wechselnden Abfrageparameter.

Die Prüfung läuft alle 60 Sekunden, wenn der Tab sichtbar ist, außerdem beim erneuten Aktivieren und beim Zurückkehren aus dem Back/Forward-Cache. Wird eine neue Kennung gefunden, wird die Seite mit einem versionsabhängigen URL-Parameter neu geladen. Offline-Seiten bleiben nutzbar; fehlerhafte Versionsantworten und wiederholte Reloads derselben Version werden abgefangen. Bereits vor dieser Erweiterung geöffnete alte Seiten müssen einmal neu geöffnet werden.

`update-check.js` ist die ORBIT-Implementierung; das Karussell enthält dieselbe Logik unter `lib/page-updates.js`. `tools/deploy-pi.py` veröffentlicht die Versionsdatei erst nach den zugehörigen Assets und der HTML-Datei. `npm test` enthält Integrationstests für neue Versionen, Offline-Betrieb, Sichtbarkeitswechsel, den Back/Forward-Cache und Reload-Schleifen.
