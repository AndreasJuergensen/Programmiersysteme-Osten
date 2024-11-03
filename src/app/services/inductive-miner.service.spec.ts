import { InductiveMinerService } from './inductive-miner.service';
import { DFG } from '../classes/dfg';
import { EventLog } from '../classes/event-log';
import { CalculateDfgService } from './calculate-dfg.service';
import { TransitionToTransitionArc } from '../classes/petri-net';

describe('InductiveMinerService', () => {
    let calcService: CalculateDfgService;
    let sut: InductiveMinerService;
    let inputDFG: DFG;

    beforeEach(() => {
        calcService = new CalculateDfgService();
        sut = new InductiveMinerService();
        inputDFG = new DFG('inputDFG');
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

        const result = sut.mine(inputDFG, cutArcs);

        expect(result).toEqual('excellent!');
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

        const result = sut.mine(inputDFG, cutArcs);

        expect(result).not.toEqual('excellent!');
    });
});
