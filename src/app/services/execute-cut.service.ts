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
    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _calculateDfgService: CalculateDfgService,
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
            return;
        }

        let eventLogs = new Array<EventLog>();
        let Dfgs = new Array<Dfg>();

        switch (selectedCut) {
            case cutType.ExclusiveCut:
                eventLogs = dfg.eventLog.splitByExclusiveCut(a1);
                Dfgs = this.createSubDfgs(eventLogs[0], eventLogs[1]);
                this._petriNetManagementService.updatePnByExclusiveCut(
                    dfg,
                    Dfgs[0],
                    Dfgs[1],
                );
                break;
            case cutType.SequenceCut:
                eventLogs = dfg.eventLog.splitBySequenceCut(a2);
                Dfgs = this.createSubDfgs(eventLogs[0], eventLogs[1]);
                this._petriNetManagementService.updatePnBySequenceCut(
                    dfg,
                    Dfgs[0],
                    Dfgs[1],
                );
                break;
            case cutType.ParallelCut:
                eventLogs = dfg.eventLog.splitByParallelCut(a1);
                Dfgs = this.createSubDfgs(eventLogs[0], eventLogs[1]);
                this._petriNetManagementService.updatePnByParallelCut(
                    dfg,
                    Dfgs[0],
                    Dfgs[1],
                );
                break;
            case cutType.LoopCut:
                eventLogs = dfg.eventLog.splitByLoopCut(a1, a2);
                Dfgs = this.createSubDfgs(eventLogs[0], eventLogs[1]);
                this._petriNetManagementService.updatePnByLoopCut(
                    dfg,
                    Dfgs[0],
                    Dfgs[1],
                );
                break;
        }

        console.log('Cut durchgefuehrt!' + ' selected Cut: ' + selectedCut); // hier spaeter Aufruf des Feedback-Service

        console.log('Petri Netz aktualisiert!'); // hier spaeter Aufruf des Feedback-Service
    }

    private createSubDfgs(
        eventLog1: EventLog,
        eventLog2: EventLog,
    ): Array<Dfg> {
        let Dfgs = new Array<Dfg>();
        Dfgs.push(this._calculateDfgService.calculate(eventLog1));
        Dfgs.push(this._calculateDfgService.calculate(eventLog2));

        return Dfgs;
    }
}
