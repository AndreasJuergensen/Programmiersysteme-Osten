import { Injectable } from '@angular/core';
import { CalculateDfgService } from './calculate-dfg.service';
import { Dfg } from '../classes/dfg/dfg';
import { Arcs } from '../classes/dfg/arcs';
import { Activities } from '../classes/dfg/activities';
import { EventLog } from '../classes/event-log';
import { PetriNetManagementService } from './petri-net-management.service';
import { CutType } from '../components/cut-execution/cut-execution.component';
import { ShowFeedbackService } from './show-feedback.service';
import { PetriNet } from '../classes/petrinet/petri-net';

@Injectable({
    providedIn: 'root',
})
export class ExecuteCutService {
    private _petriNet!: PetriNet;

    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _calculateDfgService: CalculateDfgService,
        private _feedbackService: ShowFeedbackService,
    ) {
        this._petriNetManagementService.petriNet$.subscribe((pn) => {
            this._petriNet = pn;
        });
    }

    public execute(dfg: Dfg, selectedArcs: Arcs, selectedCut: CutType): void {
        const cutFeasibilityResults: {
            cutIsPossible: boolean;
            matchingCut: CutType | null;
            a1: Activities;
            a2: Activities;
        }[] = dfg.canBeCutBy(selectedArcs, selectedCut);
        if (cutFeasibilityResults.length === 1) {
            this._feedbackService.showMessage(
                'Not a valid Cut! Please try again!',
                true,
                'The chosen arcs do not fit the selected cut. Please try again. For help use the help-button.',
            );
            return;
        }
        const validCut: {
            cutIsPossible: boolean;
            matchingCut: CutType | null;
            a1: Activities;
            a2: Activities;
        } = cutFeasibilityResults[0];
        for (let i = 1; i < cutFeasibilityResults.length; i++) {
            if (
                cutFeasibilityResults[i].cutIsPossible &&
                cutFeasibilityResults[i].matchingCut === selectedCut
            ) {
                this._feedbackService.showMessage(
                    'Too many arcs selected. Please select minimum amount of required arcs.',
                    true,
                );
                return;
            }
        }

        let subEventLogs: [EventLog, EventLog];
        let subDfgs: [Dfg, Dfg];
        switch (selectedCut) {
            case CutType.ExclusiveCut:
                subEventLogs = dfg.eventLog.splitByExclusiveCut(validCut.a1);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnByExclusiveCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
            case CutType.SequenceCut:
                subEventLogs = dfg.eventLog.splitBySequenceCut(validCut.a2);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnBySequenceCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
            case CutType.ParallelCut:
                subEventLogs = dfg.eventLog.splitByParallelCut(validCut.a1);
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnByParallelCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
            case CutType.LoopCut:
                subEventLogs = dfg.eventLog.splitByLoopCut(
                    validCut.a1,
                    validCut.a2,
                );
                subDfgs = this.createSubDfgs(subEventLogs);
                this._petriNetManagementService.updatePnByLoopCut(
                    dfg,
                    subDfgs[0],
                    subDfgs[1],
                );
                break;
        }
        if (this._petriNet.isBasicPetriNet()) {
            this._petriNetManagementService.showEventLogCompletelySplitted();
            return;
        }
        this._feedbackService.showMessage(selectedCut + ' executed', false);
    }

    private createSubDfgs(eventLogs: [EventLog, EventLog]): [Dfg, Dfg] {
        return [
            this._calculateDfgService.calculate(eventLogs[0]),
            this._calculateDfgService.calculate(eventLogs[1]),
        ];
    }
}
