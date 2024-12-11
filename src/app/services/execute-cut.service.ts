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
    private calculateDfgService: CalculateDfgService =
        new CalculateDfgService();

    constructor(
        private _petriNetManagementService: PetriNetManagementService,
    ) {}

    public execute(dfg: Dfg, selectedArcs: Arcs, selectedCut: string): void {
        const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const validCutOrNot: boolean =
            dfg.canBeCutIn(a1, a2).result &&
            dfg.canBeCutIn(a1, a2).matchingcut === selectedCut;

        if (!validCutOrNot) {
            console.log('kein valider Cut! Bitte nochmal probieren!'); // hier spaeter Aufruf des Feedback-Service
        } else {
            let eventLogs = new Array<EventLog>();

            switch (selectedCut) {
                case cutType.ExclusiveCut:
                    eventLogs = dfg.getEventLog().splitByExclusiveCut(a1);
                    break;
                case cutType.SequenceCut:
                    eventLogs = dfg.getEventLog().splitBySequenceCut(a2);
                    break;
                case cutType.ParallelCut:
                    eventLogs = dfg.getEventLog().splitByParallelCut(a1);
                    break;
                case cutType.LoopCut:
                    eventLogs = dfg.getEventLog().splitByLoopCut(a1, a2);
                    break;
            }

            const subDfg1: Dfg = this.calculateDfgService.calculate(
                eventLogs[0],
            );

            const subDfg2: Dfg = this.calculateDfgService.calculate(
                eventLogs[1],
            );

            console.log('Cut durchgefuehrt!' + ' selected Cut: ' + selectedCut); // hier spaeter Aufruf des Feedback-Service

            this._petriNetManagementService.updateByWhatEverCut(
                selectedCut,
                dfg,
                subDfg1,
                subDfg2,
            );

            console.log('Petri Netz aktualisiert!'); // hier spaeter Aufruf des Feedback-Service

            // Petri Netz zurückgeben mit Übergabe des Original-DFG und der Teil-DFGs
        }
    }

    // Kanten / Cut an Service zur Ueberpruefung weitergeben
    // auf Ueberpruefung warten

    // true --> DFG aktualsieren + Feedback erfolgreicher Cut durchgefuehrt

    // false --> Feedback kein Cut durchgefuehrt, erneut pruefen + ausgewaehlte Cuts ausgewaehlt lassen
}
