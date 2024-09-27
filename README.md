# Codegerüst
63681 Fachpraktikum Programmiersysteme


## Entwicklungsumgebung

Um den Codegerüst zum Laufen zu bringen, brauchen Sie die Laufzeitumgebung `Node.js`. Das Projekt basiert auf Angular 18.

Die Liste von kompatiblen `Node.js` Versionen finden Sie [hier](https://angular.dev/reference/versions). Offizielle Angular Anweisungen zur Einrichtung der Entwicklungsumgebung finden Sie [hier](https://angular.dev/tools/cli/setup-local).


## Dokumentation

Die Seitenelementen sind überwiegend mithilfe von CSS Flexbox ausgerichtet. Hilfreiche Unterlagen zum layouten mit Flexbox finden Sie [hier](https://css-tricks.com/snippets/css/a-guide-to-flexbox/).

Das Projekt enthält die folgenden Bibliotheken:

### Angular Material

Enthält Komponenten für Benutzeroberflächen. Die [Dokumentation](https://material.angular.io/components/categories) enthält viele Codebeispiele.

### Angular Material Icons

Ermöglicht durch die `<mat-icon>` Komponente alle Material Ikonen zu nutzen.
* [Dokumentation](https://material.angular.io/components/icon/overview)
* [Liste von Ikonen](https://fonts.google.com/icons)

### RxJs

Vereinfacht die Verarbeitung von asynchron auftauchenden Ereignissen. 
* [Dokumentation](https://rxjs.dev/guide/overview) 


## Petri-Netz Dateiformat

Das Projekt enthält zwei Referenzmodelle die dasselbe Petri-Netz in unterschiedlichen Formaten enthalten. Alle Referenzdateien befinden sich unter [src/reference-models](./src/reference-models).
* `ilpn_reference_model.json` können Sie mit einem beliebigen Modul aus FaPra WiSe 2023/24 der [I ❤ Petri Nets](https://www.fernuni-hagen.de/ilovepetrinets/) Website öffnen
* `woped_reference_model.pnml` können Sie mit dem [Workflow Petri Net Designer](https://woped.dhbw-karlsruhe.de/?page_id=22) öffnen


## Inductive miner

Der [Inductive miner visualizer](https://im-viz.informatik.uni-mannheim.de/) der Uni Mannheim führt den Inductive miner schrittweise durch.

Eine weitere Implementierung des Inductive miners finden Sie auch im [ProM](https://promtools.org/) unter dem Namen "Mine Petri net with Inductive Miner".
