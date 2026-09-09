# Prüfung der lokalen Version

Stand: 9. September 2026. Die Veröffentlichung auf GitHub Pages steht noch aus.

- `node --test tests/*.test.js`: **187 Tests bestanden, 0 fehlgeschlagen**. Die Tests prüfen die Aufgabenerzeugung über Themen, Klassen und Schwierigkeitsstufen, Antwortprüfung, Rechenwege, Null- und Grenzfälle, Speicherung, Profile und Münzkäufe.
- Über 30.000 prozedural erzeugte Aufgaben wurden anhand unabhängiger Ergebnisprüfungen kontrolliert. Zusätzlich wurden schriftliche Rechenwege an 3.000 Aufgaben spaltenweise geprüft.
- Browserprüfung mit Microsoft Edge: Startseite, richtige und falsche Antworten, Tipps, gemeinsames Lösen, komplette Runde, Wiederherstellung nach Neuladen und getrennte Profile.
- Alle 31 Themen im mobilen Browser geöffnet und ihre Lösungen angezeigt; alle 31 Themen auf „Knifflig“ mit einer korrekten Antwort bei 320 Pixel Breite durchgespielt. Kein horizontales Überlaufen, keine JavaScript-Fehler.
- Eine Runde mit einem zunächst falschen Versuch ergab korrekt 45 Sterne und 9 Münzen. Fortschritt blieb nach Neuladen erhalten.
- Begleiter gekauft, ausgewählt und nach Neuladen wiedergefunden. Export und bestätigter Import erhielten den Münzstand. HTML in einem importierten Profilnamen wurde als Text dargestellt.
- Druckausgabe mit 16 Aufgaben und separatem Lösungsblatt im Browser erzeugt. Beide A4-Seiten gerendert und visuell auf Lesbarkeit, Abstände und abgeschnittene Inhalte geprüft.
- Quellcodeprüfung: Profile und Importe werden validiert, Texte vor HTML-Ausgabe maskiert, keine Trackingbibliotheken, kein Backend für Lernstände. Der Entwicklungsserver ist nur über die lokale Loopback-Adresse erreichbar.
- JavaScript und das PowerShell-Veröffentlichungsskript syntaktisch geprüft. Das Veröffentlichungsskript wurde nicht mit GitHub-Zugang ausgeführt.

Diese Prüfung belegt die genannten Abläufe in Edge. Sie ist keine Prüfung aller Browser oder eine amtliche Freigabe der Lerninhalte. Nach einer Veröffentlichung sind die öffentliche Adresse, Ressourcenpfade und zentrale Bedienabläufe dort erneut zu prüfen.
