import { DFG } from './dfg';
import { EventLog } from './event-log';
import { DFGTransition, TransitionToTransitionArc } from './petri-net';

export interface Cut {
    readonly partEventLog1?: EventLog;
    readonly partEventLog2?: EventLog;
    readonly partDFG1?: DFG;
    readonly partDFG2?: DFG;
    readonly cutArcs: TransitionToTransitionArc[];
    feedback: string;

    validate(inputDFG: DFG): Set<DFGTransition>[];
    partitionEventLog(
        inputEventLog: EventLog,
        sets: Set<DFGTransition>[],
    ): void;
    calculatePartDFGs(): void;
    getFeedback(): string;
}
