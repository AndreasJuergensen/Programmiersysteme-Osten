import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { PetriNet } from '../classes/petrinet/petri-net';
import { PetriNetManagementService } from './petri-net-management.service';
import { ShowFeedbackService } from './show-feedback.service';
import { Dfg } from '../classes/dfg/dfg';
import { CalculateDfgService } from './calculate-dfg.service';
import { Activity } from '../classes/dfg/activities';

@Injectable({
    providedIn: 'root',
})
export class FallThroughHandlingService {
    private _petriNet!: PetriNet;
    private _timeoutID: any;
    private _resolvePromise: (value: string) => void = () => {};

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
        this._showFeedbackService.showMessage(
            'Select the activity you want to detach.',
            false,
        );
        this.startWaitingForActivityClick('aopt');
    }

    executeFlowerFallThrough(): void {
        this._showFeedbackService.showMessage(
            'Select any activity from the DFG for which a Flower-Model should be created.',
            false,
        );
        this.startWaitingForActivityClick('flower');
    }

    private startWaitingForActivityClick(caller: string): void {
        if (caller === 'aopt') {
            this.waitForActivityClick()
                .then((response) => {
                    this.continueAOPTExecution(response);
                })
                .catch((error) => {
                    this._showFeedbackService.showMessage(error, true);
                });
        }
        if (caller === 'flower') {
            this.waitForActivityClick()
                .then((response) => {
                    this.continueFlowerExecution(response);
                })
                .catch((error) => {
                    this._showFeedbackService.showMessage(error, true);
                });
        }
    }

    private waitForActivityClick(): Promise<string> {
        return new Promise((resolve, reject) => {
            this._resolvePromise = resolve;
            this._timeoutID = setTimeout(() => {
                reject('No activity clicked, Fall-Through attempt aborted.');
            }, 10000);
        });
    }

    private continueAOPTExecution(activityName: string): void {
        for (const dfg of this._petriNet.getDFGs()) {
            if (dfg.activities.containsActivityWithName(activityName)) {
                if (dfg.canBeCutByAnyPartitions()) {
                    this._showFeedbackService.showMessage(
                        'Another cut can be performed in this DFG, try this first.',
                        true,
                    );
                    return;
                }
                const activity: Activity =
                    dfg.activities.getActivityByName(activityName);
                if (dfg.eventLog.activityOncePerTraceIsPossibleBy(activity)) {
                    const eventLogs: [EventLog, EventLog] =
                        dfg.eventLog.splitByActivityOncePerTrace(activity);
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
                this._showFeedbackService.showMessage(
                    'Activity-Once-Per-Trace Fall-Through is not valid for the selected activity',
                    true,
                );
                return;
            }
        }
    }

    continueFlowerExecution(activityName: string): void {
        for (const dfg of this._petriNet.getDFGs()) {
            if (dfg.activities.containsActivityWithName(activityName)) {
                if (dfg.canBeCutByAnyPartitions()) {
                    this._showFeedbackService.showMessage(
                        'Another cut can be performed in this DFG, try this first.',
                        true,
                    );
                    return;
                }
                const eventLog: EventLog = dfg.eventLog;
                for (const trace of eventLog.getAllTraces()) {
                    for (const activity of trace.getAllActivities()) {
                        if (
                            eventLog.activityOncePerTraceIsPossibleBy(activity)
                        ) {
                            this._showFeedbackService.showMessage(
                                'Another Fall-Through can be performed in this Petri Net, try this first.',
                                true,
                            );
                            return;
                        }
                    }
                }
                const eventLogs: EventLog[] =
                    eventLog.splitByFlowerFallThrough();
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

    processActivityClick(activityName: string) {
        clearTimeout(this._timeoutID);
        this._resolvePromise(activityName);
    }
}
