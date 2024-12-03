import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { Activities } from '../classes/dfg/activities';
import { EventLog } from '../classes/event-log';

@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    constructor(private calculateDfgService: CalculateDfgService) {} // private selectedArcs: Arcs, // private dfg: Dfg,

    public execute(
        dfg: Dfg,
        selectedArcs: Arcs,
        selectedCut: string,
    ): { dfg1: Dfg; dfg2: Dfg } | void {
        const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        if (!this.validateCut(dfg, a1, a2, selectedCut)) {
            console.log('kein valider Cut! Bitte nochmal probieren!'); // hier spaeter Aufruf des Feedback-Service
        } else {
            return {
                dfg1: this.cut(selectedCut, dfg.getEventLog(), a1, a2).dfg1,
                dfg2: this.cut(selectedCut, dfg.getEventLog(), a1, a2).dfg2,
            };
        }
    }

    public cut(
        selectedCut: string,
        eventLog: EventLog,
        a1: Activities,
        a2: Activities,
    ): { dfg1: Dfg; dfg2: Dfg } {
        console.log('cut durchgefuehrt!' + ' selected Cut: ' + selectedCut);
        // if (this.validationService.xxx()) {return this.calculateDfgService().dfgbuilder....}
        //else {console.error 'kein valider Cut'}

        // validateCut: True? --> split Event Log + split DFG / calculateDFG for each of the new eventLog

        let eventLogs: EventLog[] = new Array();

        switch (selectedCut) {
            case 'ExclusiveCut':
                eventLogs = eventLog.splitByExclusiveCut(a1);
                break;
            case 'SequenceCut':
                eventLogs = eventLog.splitBySequenceCut(a2);
                break;
            case 'ParallelCut':
                eventLogs = eventLog.splitByParallelCut(a1);
                break;
            case 'LoopCut':
                eventLogs = eventLog.splitByLoopCut(a1, a2);
                break;
        }

        const subDfg1: Dfg = this.calculateDfgService.calculate(eventLogs[0]);
        const subDfg2: Dfg = this.calculateDfgService.calculate(eventLogs[1]);

        return { dfg1: subDfg1, dfg2: subDfg2 };
    }

    // Methode, um Kanten einzulesen
    getSelectedArcsFromDrawingArea(): void {}

    // Kanten / Cut an Service zur Ueberpruefung weitergeben
    // auf Ueberpruefung warten

    // true --> DFG aktualsieren + Feedback erfolgreicher Cut durchgefuehrt

    // false --> Feedback kein Cut durchgefuehrt, erneut pruefen + ausgewaehlte Cuts ausgewaehlt lassen

    public validateCut(
        dfg: Dfg,
        a1: Activities,
        a2: Activities,
        selectedCut: string,
    ): boolean {
        // const calculatedDfg: Dfg = dfg;
        // const arcsSelectedByUser: Arcs = selectedArcs;
        // const cutSelectedByUserViaRadioButton: string = selectedCut;

        // const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        // const a1: Activities = partitions[0];
        // const a2: Activities = partitions[1];

        // let result: boolean = false;

        // if (
        //     dfg.canBeCutIn(a1, a2).result &&
        //     dfg.canBeCutIn(a1, a2).matchingcut === selectedCut
        // ) {
        //     result = true;
        // }

        // return result;

        return (
            dfg.canBeCutIn(a1, a2).result &&
            dfg.canBeCutIn(a1, a2).matchingcut === selectedCut
        );
        // Event Log --> DFG --> Cut --> Partitionen --> CanBeCutIn --> True / False
    }
}
