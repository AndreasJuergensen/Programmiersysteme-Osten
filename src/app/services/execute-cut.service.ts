import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { Activities } from '../classes/dfg/activities';
import { EventLog } from '../classes/event-log';
import { PetriNetManagementService } from './petri-net-management.service';
import { cutType } from '../components/cut-execution/cut-execution.component';

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

    public execute(dfg: Dfg, selectedArcs: Arcs, selectedCut: string): void {
        const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        let tempDfgArray = new Array<Dfg>();

        if (!this.validateCut(dfg, a1, a2, selectedCut)) {
            console.log('kein valider Cut! Bitte nochmal probieren!'); // hier spaeter Aufruf des Feedback-Service
        } else {
            // console.log('3: else - Teil');
            // console.log(dfg.getEventLog());
            // const subDfg1: Dfg = this.cut(
            //     selectedCut,
            //     dfg.getEventLog(),
            //     a1,
            //     a2,
            // )[0];
            // const subDfg2: Dfg = this.cut(
            //     selectedCut,
            //     dfg.getEventLog(),
            //     a1,
            //     a2,
            // )[1];
            tempDfgArray = this.cut(selectedCut, dfg.getEventLog(), a1, a2);

            this._petriNetManagementService.updateByWhatEverCut(
                selectedCut,
                dfg,
                tempDfgArray[0],
                tempDfgArray[1],
            );
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
        console.log('Cut durchgefuehrt!' + ' selected Cut: ' + selectedCut);

        let eventLogs = new Array<EventLog>();

        switch (selectedCut) {
            case cutType.ExclusiveCut:
                eventLogs.push(eventLog.splitByExclusiveCut(a1)[0]);
                // console.log(eventLogs[0]);
                eventLogs.push(eventLog.splitByExclusiveCut(a1)[1]);
                // console.log(eventLogs[1]);
                break;
            case cutType.SequenceCut:
                eventLogs.push(eventLog.splitBySequenceCut(a2)[0]);
                // console.log(eventLogs[0]);
                eventLogs.push(eventLog.splitBySequenceCut(a2)[1]);
                break;
            case cutType.ParallelCut:
                eventLogs.push(eventLog.splitByParallelCut(a1)[0]);
                // console.log(eventLogs[0]);
                eventLogs.push(eventLog.splitByParallelCut(a1)[1]);
                break;
            case cutType.LoopCut:
                eventLogs.push(eventLog.splitByLoopCut(a1, a2)[0]);
                eventLogs.push(eventLog.splitByLoopCut(a1, a2)[1]);
                break;
        }

        const subDfg1: Dfg = this.calculateDfgService.calculate(eventLogs[0]);

        const subDfg2: Dfg = this.calculateDfgService.calculate(eventLogs[1]);

        return [subDfg1, subDfg2];
    }

    public validateCut(
        dfg: Dfg,
        a1: Activities,
        a2: Activities,
        selectedCut: string,
    ): boolean {
        console.log('validate');

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
