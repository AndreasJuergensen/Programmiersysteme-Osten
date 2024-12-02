import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { Activities } from '../classes/dfg/activities';

@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    constructor() {} // private selectedArcs: Arcs, // private dfg: Dfg,

    public cut(selectedCut: string): void {
        console.log('cut durchgefuehrt!' + ' selected Cut: ' + selectedCut);
        // if (this.validationService.xxx()) {return this.calculateDfgService().dfgbuilder....}
        //else {console.error 'kein valider Cut'}

        // validateCut: True? --> split Event Log + split DFG
    }

    // Methode, um Kanten einzulesen
    getSelectedArcsFromDrawingArea(): void {}

    // Kanten / Cut an Service zur Ueberpruefung weitergeben
    // auf Ueberpruefung warten

    // true --> DFG aktualsieren + Feedback erfolgreicher Cut durchgefuehrt

    // false --> Feedback kein Cut durchgefuehrt, erneut pruefen + ausgewaehlte Cuts ausgewaehlt lassen

    public validateCut(
        dfg: Dfg,
        selectedArcs: Arcs,
        selectedCut: string,
    ): boolean {
        // const calculatedDfg: Dfg = dfg;
        // const arcsSelectedByUser: Arcs = selectedArcs;
        // const cutSelectedByUserViaRadioButton: string = selectedCut;

        const a1: Activities = dfg.calculatePartitions(selectedArcs)[0];
        const a2: Activities = dfg.calculatePartitions(selectedArcs)[1];

        let result: boolean = false;

        if (
            dfg.canBeCutIn(a1, a2).result &&
            dfg.canBeCutIn(a1, a2).matchingcut === selectedCut
        ) {
            result = true;
        }

        return result;
        // Event Log --> DFG --> Cut --> Partitionen --> CanBeCutIn --> True / False
    }
}
