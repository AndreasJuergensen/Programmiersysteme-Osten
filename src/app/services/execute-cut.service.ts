import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { Activities } from '../classes/dfg/activities';
import { EventLog } from '../classes/event-log';
import { PetriNetManagementService } from './petri-net-management.service';


@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    // Event Log --> DFG --> Cut --> Partitionen --> CanBeCutIn --> True / False

    constructor(
        private _petriNetManagementService: PetriNetManagementService,
    ) {} // private selectedArcs: Arcs, // private dfg: Dfg,

    private calculateDfgService: CalculateDfgService =
        new CalculateDfgService();

    public execute(
        dfg: Dfg,
        selectedArcs: Arcs,
        selectedCut: string,
    ): void {
        const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        if (!this.validateCut(dfg, a1, a2, selectedCut)) {
            console.log('3: kein valider Cut! Bitte nochmal probieren!'); // hier spaeter Aufruf des Feedback-Service
        } else {
            // console.log('3: else - Teil');
            // console.log(dfg.getEventLog());
            const subDfg1: Dfg = this.cut(
                selectedCut,
                dfg.getEventLog(),
                a1,
                a2,
            )[0];
            const subDfg2: Dfg = this.cut(
                selectedCut,
                dfg.getEventLog(),
                a1,
                a2,
            )[1];

            // this._petriNetManagementService.updateByWhateverCut(abc, xyz);
            // return [subDfg1, subDfg2];
            // Petri Netz zurückgeben mit Übergabe des Original-DFG und der Teil-DFGs
        }
    }

    public cut(
        selectedCut: string,
        eventLog: EventLog,
        a1: Activities,
        a2: Activities,
    ): [Dfg, Dfg] {
        console.log('2: cut durchgefuehrt!' + ' selected Cut: ' + selectedCut);
        // let e1: EventLog = new EventLog();
        // let e2: EventLog = new EventLog();
        let eventLogs = new Array<EventLog>();

        switch (selectedCut) {
            case 'ExclusiveCut':
                eventLogs.push(eventLog.splitByExclusiveCut(a1)[0]);
                // console.log(eventLogs[0]);
                eventLogs.push(eventLog.splitByExclusiveCut(a1)[1]);
                // console.log(eventLogs[1]);
                break;
            case 'SequenceCut':
                eventLogs.push(eventLog.splitBySequenceCut(a2)[0]);
                // console.log(eventLogs[0]);
                eventLogs.push(eventLog.splitBySequenceCut(a2)[1]);
                break;
            case 'ParallelCut':
                eventLogs.push(eventLog.splitByParallelCut(a1)[0]);
                // console.log(eventLogs[0]);
                eventLogs.push(eventLog.splitByParallelCut(a1)[1]);
                break;
            case 'LoopCut':
                eventLogs = eventLog.splitByLoopCut(a1, a2);
                break;
        }

        const subDfg1: Dfg = this.calculateDfgService.calculate(eventLogs[0]);
        // console.log(subDfg1);

        const subDfg2: Dfg = this.calculateDfgService.calculate(eventLogs[1]);
        // console.log(subDfg2);

        return [subDfg1, subDfg2];
    }

    public validateCut(
        dfg: Dfg,
        a1: Activities,
        a2: Activities,
        selectedCut: string,
    ): boolean {
        console.log('1: validate');

        return (
            dfg.canBeCutIn(a1, a2).result &&
            dfg.canBeCutIn(a1, a2).matchingcut === selectedCut
        );
    }

    // Kanten / Cut an Service zur Ueberpruefung weitergeben
    // auf Ueberpruefung warten

    // true --> DFG aktualsieren + Feedback erfolgreicher Cut durchgefuehrt

    // false --> Feedback kein Cut durchgefuehrt, erneut pruefen + ausgewaehlte Cuts ausgewaehlt lassen
}
