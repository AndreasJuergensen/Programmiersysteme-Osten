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

    public execute(
        dfg: Dfg,
        selectedArcs: Arcs,
        selectedCut: CutType,
    ): boolean {
        const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const isValidCut: boolean =
            dfg.canBeCutIn(a1, a2).result &&
            dfg.canBeCutIn(a1, a2).matchingcut === selectedCut;

        if (!isValidCut) {
            // an dieser Stelle muss dann die Prüfung auf richtige und falsche Kanten erfolgen
            /*
            switch (selectedCut) {
                case CutType.ExclusiveCut:
                    if (
                        !dfg
                            .calculateAllPossibleCuts()
                            .some(
                                (cut) =>
                                    cut[0] === true &&
                                    cut[1] === CutType.ExclusiveCut,
                            )
                    ) {
                        console.log(
                            'ExclusiveCut not possible. Deselecting all arcs.',
                        );
                    }
                    console.log(selectedArcs);

                    const selectedPlayArcs = selectedArcs
                        .getArcs()
                        .filter((arc) => arc.startsAtPlay());
                    const selectedStopArcs = selectedArcs
                        .getArcs()
                        .filter((arc) => arc.endsAtStop());

                    const wrongExclusiveArcs = selectedArcs
                        .getArcs()
                        .filter(
                            (arc) => !arc.startsAtPlay() && !arc.endsAtStop(),
                        );
                    console.log(wrongExclusiveArcs);

                    const correctArcs = new Arcs();

                    for (const cut of dfg.calculateAllPossibleCuts()) {
                        // gerader Schnitt bzw. play und stop Kanten gehören zu z.B. A1
                        const selectedPlayArcsEndingInA1 =
                            selectedPlayArcs.filter((arc) =>
                                arc.endIsIncludedIn(cut[4]),
                            );
                        const selectedStopArcsStartingInA1 =
                            selectedStopArcs.filter((arc) =>
                                arc.startIsIncludedIn(cut[4]),
                            );
                        const selectedPlayArcsEndingInA2 =
                            selectedPlayArcs.filter((arc) =>
                                arc.endIsIncludedIn(cut[5]),
                            );
                        const selectedStopArcsStartingInA2 =
                            selectedStopArcs.filter((arc) =>
                                arc.startIsIncludedIn(cut[5]),
                            );

                        if (
                            selectedPlayArcsEndingInA1 &&
                            selectedStopArcsStartingInA1 &&
                            selectedPlayArcsEndingInA2.length == 0 &&
                            selectedStopArcsStartingInA2.length == 0
                        ) {
                            selectedPlayArcsEndingInA1.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                            selectedStopArcsStartingInA1.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                            //Kanten die o.g. Bedingungen erfüllen sind richtig
                            // console.log('1. Variante richtig');
                            // console.log(cut);
                        }
                        //diagonaler Schnitt z.B. playKante zu A1 und stopKante aus A2
                        else if (
                            selectedPlayArcsEndingInA1 &&
                            selectedStopArcsStartingInA2 &&
                            selectedPlayArcsEndingInA2.length == 0 &&
                            selectedStopArcsStartingInA1.length == 0
                        ) {
                            selectedPlayArcsEndingInA1.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                            selectedStopArcsStartingInA2.forEach((arc) => {
                                correctArcs.addArc(arc);
                            });
                            //Kanten die o.g. Bedingungen erfüllen sind richtig
                            // console.log('2. Variante richtig');
                            // console.log(cut);
                        } else {
                            //korrekte Play Kanten aktiv lassen
                            if (correctArcs.getArcs().length == 0) {
                                selectedPlayArcs.forEach((arc) => {
                                    if (arc.endIsIncludedIn(cut[4])) {
                                        correctArcs.addArc(arc);
                                    }
                                });
                            }
                            // console.log('3. Variante richtig');
                        }
                    }
                    console.log('Correct Arcs: ');

                    console.log(correctArcs);
                    // if()
                    // selectedArcs.getArcs().forEach((arc) => {
                    //     const isArcInCuts = dfg
                    //         .calculateAllPossibleCuts()
                    //         .some(
                    //             (cut) =>
                    //                 cut[2].containsArc(arc) ||
                    //                 cut[3].containsArc(arc),
                    //         );

                    //     if (!arc.startsAtPlay() || !arc.endsAtStop()) {
                    //         console.log(
                    //             arc.asJson().start +
                    //                 ' ' +
                    //                 arc.asJson().end +
                    //                 ` Arc is not part of a valid cut.`,
                    //         );
                    //     } else {
                    //         console.log(
                    //             arc.asJson().start +
                    //                 ' ' +
                    //                 arc.asJson().end +
                    //                 ` Arc could be part of a valid cut.`,
                    //         );
                    //         if (arc.startsAtPlay()) {
                    //             console.log('Starts at Play');
                    //         }
                    //     }
                    // wurde eine play Arc ausgewählt und führt diese zu einer der richtigen
                    // Partitionen?
                    // wurden mehrere play Arcs ausgewählt --> nur eine als richtig markieren
                    // });
                    break;
                case CutType.SequenceCut:
                    if (
                        !dfg
                            .calculateAllPossibleCuts()
                            .some(
                                (cut) =>
                                    cut[0] === true &&
                                    cut[1] === CutType.SequenceCut,
                            )
                    ) {
                        console.log(
                            'SequenceCut not possible. Deselecting all arcs.',
                        );
                    }
                    break;
                case CutType.ParallelCut:
                    if (
                        !dfg
                            .calculateAllPossibleCuts()
                            .some(
                                (cut) =>
                                    cut[0] === true &&
                                    cut[1] === CutType.ParallelCut,
                            )
                    ) {
                        console.log(
                            'LoopCut not possible. Deselecting all arcs.',
                        );
                    }
                    break;
                case CutType.LoopCut:
                    if (
                        !dfg
                            .calculateAllPossibleCuts()
                            .some(
                                (cut) =>
                                    cut[0] === true &&
                                    cut[1] === CutType.LoopCut,
                            )
                    ) {
                        console.log(
                            'LoopCut not possible. Deselecting all arcs.',
                        );
                    }
                    break;
            }
                    */
            this._feedbackService.showMessage(
                'Not a valid Cut! Please try again!',
                true,
                'The chosen arcs do not fit the selected cut. Please try again. For help use the help-button.',
            );
            return false;
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
        this._feedbackService.showMessage('The petri net was updated.', false);

        return true;
    }

    // public validateCut(
    //     dfg: Dfg,
    //     selectedArcs: Arcs,
    //     selectedCut: CutType,
    // ): boolean {
    //     const partitions: Activities[] = dfg.calculatePartitions(selectedArcs);
    //     const a1: Activities = partitions[0];
    //     const a2: Activities = partitions[1];

    //     const isValidCut: boolean =
    //         dfg.canBeCutIn(a1, a2).result &&
    //         dfg.canBeCutIn(a1, a2).matchingcut === selectedCut;

    //     return isValidCut;
    // }

    private createSubDfgs(eventLogs: [EventLog, EventLog]): [Dfg, Dfg] {
        return [
            this._calculateDfgService.calculate(eventLogs[0]),
            this._calculateDfgService.calculate(eventLogs[1]),
        ];
    }
}
