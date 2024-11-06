import { InductiveMinerService } from './inductive-miner.service';
import { DFG } from '../classes/dfg';
import { EventLog } from '../classes/event-log';
import { CalculateDfgService } from './calculate-dfg.service';
import { DFGTransition, TransitionToTransitionArc } from '../classes/petri-net';
import { ExclusiveCut } from '../classes/exclusive-cut';

describe('InductiveMinerService', () => {
    let calcService: CalculateDfgService;
    let sut: InductiveMinerService;
    let inputDFG: DFG;

    beforeEach(() => {
        calcService = new CalculateDfgService();
        sut = new InductiveMinerService();
        inputDFG = new DFG('inputDFG');
    });

    it('exclusive cut contains not correct amount(1) of arcs', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'C' }, { name: 'D' }] },
            ],
        };
        inputDFG = calcService.calculate(eventLog);
        const fromPlayArc = inputDFG.getArcByStartEndName('play', 'C');
        const cutArcs: TransitionToTransitionArc[] = [];
        if (fromPlayArc !== undefined) {
            cutArcs.push(fromPlayArc);
        }

        const result = sut.mine(eventLog, inputDFG, cutArcs);

        expect(result).toEqual('No cut detected, please try again.');
    });

    it('exclusive cut contains no arc from play', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'C' }, { name: 'D' }] },
            ],
        };
        inputDFG = calcService.calculate(eventLog);
        const arc = inputDFG.getArcByStartEndName('C', 'D');
        const toStopArc = inputDFG.getArcByStartEndName('D', 'stop');
        const cutArcs: TransitionToTransitionArc[] = [];
        if (arc !== undefined && toStopArc !== undefined) {
            cutArcs.push(arc);
            cutArcs.push(toStopArc);
        }

        const result = sut.mine(eventLog, inputDFG, cutArcs);

        expect(result).toEqual('No cut detected, please try again.');
    });

    it('exclusive cut contains no arc to stop', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'C' }, { name: 'D' }] },
            ],
        };
        inputDFG = calcService.calculate(eventLog);
        const fromPlayArc = inputDFG.getArcByStartEndName('play', 'C');
        const arc = inputDFG.getArcByStartEndName('C', 'D');
        const cutArcs: TransitionToTransitionArc[] = [];
        if (arc !== undefined && fromPlayArc !== undefined) {
            cutArcs.push(fromPlayArc);
            cutArcs.push(arc);
        }

        const result = sut.mine(eventLog, inputDFG, cutArcs);

        expect(result).toEqual('No cut detected, please try again.');
    });

    it('exclusive cut is valid', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'C' }, { name: 'D' }] },
            ],
        };
        inputDFG = calcService.calculate(eventLog);
        const fromPlayArc = inputDFG.getArcByStartEndName('play', 'C');
        const toStopArc = inputDFG.getArcByStartEndName('D', 'stop');
        const cutArcs: TransitionToTransitionArc[] = [];
        if (fromPlayArc !== undefined && toStopArc !== undefined) {
            cutArcs.push(fromPlayArc);
            cutArcs.push(toStopArc);
        }

        const result = sut.mine(eventLog, inputDFG, cutArcs);

        const expectedCut: ExclusiveCut = new ExclusiveCut(cutArcs);
        expectedCut.feedback = 'valid';
        expectedCut.partEventLog2 = {
            traces: [{ activities: [{ name: 'A' }, { name: 'B' }] }],
        };
        expectedCut.partEventLog1 = {
            traces: [{ activities: [{ name: 'C' }, { name: 'D' }] }],
        };
        expectedCut.partDFG1 = calcService.calculate(expectedCut.partEventLog1);
        expectedCut.partDFG2 = calcService.calculate(expectedCut.partEventLog2);

        expect(result).toEqual(expectedCut);
    });

    it('exclusive cut is not valid', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'C' }, { name: 'D' }] },
                { activities: [{ name: 'C' }, { name: 'B' }] },
            ],
        };
        inputDFG = calcService.calculate(eventLog);
        const fromPlayArc = inputDFG.getArcByStartEndName('play', 'C');
        const toStopArc = inputDFG.getArcByStartEndName('D', 'stop');
        const cutArcs: TransitionToTransitionArc[] = [];
        if (fromPlayArc !== undefined && toStopArc !== undefined) {
            cutArcs.push(fromPlayArc);
            cutArcs.push(toStopArc);
        }

        const result = sut.mine(eventLog, inputDFG, cutArcs);

        const expectedCut: ExclusiveCut = new ExclusiveCut(cutArcs);
        expectedCut.feedback =
            'An exclusive cut must not contain any arc between the subsets of its origin-DFG.';

        expect(result).toEqual(expectedCut.feedback);
    });
});
