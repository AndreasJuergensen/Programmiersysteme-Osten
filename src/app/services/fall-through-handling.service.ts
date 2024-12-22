import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { PetriNet } from '../classes/petrinet/petri-net';
import { PetriNetManagementService } from './petri-net-management.service';
import { ShowFeedbackService } from './show-feedback.service';
import { Dfg } from '../classes/dfg/dfg';
import { CalculateDfgService } from './calculate-dfg.service';

@Injectable({
    providedIn: 'root',
})
export class FallThroughHandlingService {
    private _petriNet!: PetriNet;

    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _showFeedbackService: ShowFeedbackService,
        private _calculateDfgService: CalculateDfgService,
    ) {
        this._petriNetManagementService.petriNet$.subscribe((pn) => {
            this._petriNet = pn;
        });
    }

    executeActivityOncePerTraceFallThrough(): void {
        if (!this._petriNet.isInitialized) {
            // not necessary if buttons are deactivated on not initialized PN
            // call feedback 'You need to import or create a PN first'
            return;
        }
        if (this._petriNet.cutCanBeExecuted()) {
            this._showFeedbackService.showMessage(
                'Another Cut can be performed on this PetriNet',
                true,
            );
            // call feedback 'Another Cut can be performed on PetriNet'
            return;
        }
        for (const dfg of this._petriNet.getAllTransitionsThatAreDFGs()) {
            const eventLog: EventLog = dfg.eventLog;
            for (const activity of dfg.activities.getAllActivites()) {
                if (eventLog.activityOncePerTraceIsPossibleBy(activity)) {
                    const eventLogs: [EventLog, EventLog] =
                        eventLog.splitByActivityOncePerTrace(activity);
                    const subDFGs: [Dfg, Dfg] = [
                        this._calculateDfgService.calculate(eventLogs[0]),
                        this._calculateDfgService.calculate(eventLogs[1]),
                    ];
                    this._petriNetManagementService.updatePnByParallelCut(
                        dfg,
                        subDFGs[0],
                        subDFGs[1],
                    );
                    return;
                }
            }
        }
        this._showFeedbackService.showMessage(
            'Activity Once Per Trace Fall Through is not feasible on any DFG within this PetriNet',
            true,
        );
    }

    executeFlowerFallThrough(): void {
        if (!this._petriNet.isInitialized) {
            // not necessary if buttons are deactivated on not initialized PN
            // call feedback 'You need to import or create a PN first'
            return;
        }
        if (
            this._petriNet.cutCanBeExecuted() ||
            this._petriNet.acitivityOncePerTraceIsFeasible()
        ) {
            this._showFeedbackService.showMessage(
                'Another Cut or Fall-Through is possible and need to be performed before Flower Fall-Through can be performed',
                true,
            );
            return;
        }
        for (const dfg of this._petriNet.getAllTransitionsThatAreDFGs()) {
            const eventLog: EventLog = dfg.eventLog;
            const eventLogs: EventLog[] = eventLog.splitByFlowerFallThrough();
            const subDFGs: Dfg[] = [];
            for (const log of eventLogs) {
                subDFGs.push(this._calculateDfgService.calculate(log));
            }
            this._petriNetManagementService.updatePnByFlowerFallThrough(
                dfg,
                subDFGs,
            );
            return;
        }
    }
}
