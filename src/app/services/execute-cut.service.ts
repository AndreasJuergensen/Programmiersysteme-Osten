import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { Activities } from '../classes/dfg/activities';
import { EventLog } from '../classes/event-log';
import { PetriNetManagementService } from './petri-net-management.service';
import { CutType } from '../components/cut-execution/cut-execution.component';
import { ShowFeedbackService } from './show-feedback.service';

@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _calculateDfgService: CalculateDfgService,
        private _feedbackService: ShowFeedbackService,
    ) {}

    public execute(dfg: Dfg, selectedArcs: Arcs, selectedCut: CutType): void {
        const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const isValidCut: boolean =
            dfg.canBeCutIn(a1, a2).result &&
            dfg.canBeCutIn(a1, a2).matchingcut === selectedCut;

        if (!isValidCut) {
            this._feedbackService.showMessage(
                'Not a valid Cut! Please try again!',
                true,
                'The chosen arcs do not fit the selected cut. Please try again. For help use the help-button.',
            );
            return;
        }

        let subEventLogs: [EventLog, EventLog];
        let subDfgs: [Dfg, Dfg];

        switch (selectedCut) {
            case CutType.ExclusiveCut:
                subEventLogs = dfg.eventLog.splitByExclusiveCut(a1);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnByExclusiveCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
            case CutType.SequenceCut:
                subEventLogs = dfg.eventLog.splitBySequenceCut(a2);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnBySequenceCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
            case CutType.ParallelCut:
                subEventLogs = dfg.eventLog.splitByParallelCut(a1);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnByParallelCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
            case CutType.LoopCut:
                subEventLogs = dfg.eventLog.splitByLoopCut(a1, a2);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnByLoopCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
        }

        this._feedbackService.showMessage(
            'Cut was executed successfully! ' + '(' + selectedCut + ')',
            false,
        );
        this._feedbackService.showMessage('The petri net was updated.', true);
    }

    private createSubDfgs(eventLogs: [EventLog, EventLog]): [Dfg, Dfg] {
        return [
            this._calculateDfgService.calculate(eventLogs[0]),
            this._calculateDfgService.calculate(eventLogs[1]),
        ];
    }
}
