import { CalculateDfgService } from '../services/calculate-dfg.service';
import { Cut } from './cut';
import { DFG } from './dfg';
import { EventLog } from './event-log';
import { DFGTransition, TransitionToTransitionArc } from './petri-net';

export class ExclusiveCut implements Cut {
    // optional because of init will be done only if cut is valid
    partEventLog1?: EventLog;
    partEventLog2?: EventLog;
    partDFG1?: DFG;
    partDFG2?: DFG;
    cutArcs: TransitionToTransitionArc[];
    feedback: string = '';

    constructor(cutArcs: TransitionToTransitionArc[]) {
        this.cutArcs = cutArcs;
    }

    validate(inputDFG: DFG): Set<DFGTransition>[] {
        const set1: Set<DFGTransition> = new Set();
        const set2: Set<DFGTransition> = new Set();
        this.allocateTransitionsToSet(inputDFG, set1, set2);
        this.feedback = this.validateExclusiveness(set1, set2);
        const subSets: Set<DFGTransition>[] = [];
        subSets.push(set1);
        subSets.push(set2);
        return subSets;
    }

    private allocateTransitionsToSet(
        inputDFG: DFG,
        subSet1: Set<DFGTransition>,
        subSet2: Set<DFGTransition>,
    ): void {
        const firstTransitionSet1: DFGTransition =
            this.cutArcs[0].start.name === 'play'
                ? this.cutArcs[0].end
                : this.cutArcs[1].end;
        subSet1.add(firstTransitionSet1);
        this.allocateFollowingTransitions(inputDFG, subSet1);

        inputDFG
            .getPlayFollowingTransitionsExcept(firstTransitionSet1)
            .forEach((transition) => {
                subSet2.add(transition);
            });
        this.allocateFollowingTransitions(inputDFG, subSet2);
    }

    private allocateFollowingTransitions(
        inputDFG: DFG,
        subSet: Set<DFGTransition>,
    ): void {
        subSet.forEach((transition) => {
            inputDFG
                .getFollowingTransitions(transition)
                .forEach((followingTransition) => {
                    subSet.add(followingTransition);
                });
        });
    }

    // if a transition occurs in both sets, there is a connection
    // between the sets, thus the exclusive cut is not valid
    private validateExclusiveness(
        subSet1: Set<DFGTransition>,
        subSet2: Set<DFGTransition>,
    ): string {
        for (const transition of subSet1) {
            if (subSet2.has(transition)) {
                return 'An exclusive cut must not contain any arc between the subsets of its origin-DFG.';
            }
        }
        return 'valid';
    }

    partitionEventLog(
        inputEventLog: EventLog,
        subSets: Set<DFGTransition>[],
    ): void {
        this.partEventLog1 = { traces: [] };
        this.partEventLog2 = { traces: [] };
        inputEventLog.traces.forEach((trace) => {
            let traceAllocated: boolean = false;
            for (const transition of subSets[0]) {
                if (trace.activities[0].name === transition.name) {
                    this.partEventLog1!.traces.push(trace);
                    traceAllocated = true;
                    break;
                }
            }
            if (!traceAllocated) {
                this.partEventLog2!.traces.push(trace);
            }
        });
    }

    calculatePartDFGs(): void {
        const calcService: CalculateDfgService = new CalculateDfgService();
        if (
            this.partEventLog1 !== undefined &&
            this.partEventLog2 !== undefined
        ) {
            this.partDFG1 = calcService.calculate(this.partEventLog1);
            this.partDFG2 = calcService.calculate(this.partEventLog2);
        }
    }

    getFeedback(): string {
        return this.feedback;
    }
}
