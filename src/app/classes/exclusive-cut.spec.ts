import { CalculateDfgService } from '../services/calculate-dfg.service';
import { DFG } from './dfg';
import { EventLog } from './event-log';
import { ExclusiveCut } from './exclusive-cut';
import { TransitionToTransitionArc } from './petri-net';

describe('ExclusiveCutClass', () => {
    let sut: ExclusiveCut;
    let calcService: CalculateDfgService;
    let inputDFG: DFG;

    beforeEach(() => {
        inputDFG = new DFG('inputDFG');
        calcService = new CalculateDfgService();
        // sut = new ExclusiveCutClass();
    });

    it('should create an instance', () => {
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

        expect(new ExclusiveCut(cutArcs)).toBeTruthy();
    });

    it('cut contains valid arcs, but is not a valid cut', () => {
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
        
        sut = new ExclusiveCut(cutArcs);
        sut.validate(inputDFG);
        const result: string = sut.getFeedback();

        expect(result).toEqual(
            'An exclusive cut must not contain any arc between the subsets of its origin-DFG.',
        );
    });

    it('DFG contains two paths with valid cut', () => {
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
        sut = new ExclusiveCut(cutArcs);

        sut.validate(inputDFG);
        const result: string = sut.getFeedback();

        expect(result).toEqual('valid');
    });

    it('DFG contains more than two transitions with incoming arcs from play with valid cut', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'X' }, { name: 'A' }] },
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
        sut = new ExclusiveCut(cutArcs);

        sut.validate(inputDFG);
        const result: string = sut.getFeedback();

        expect(result).toEqual('valid');
    });

    it('DFG contains more than two transitions with incoming arcs from play with invalid cut', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }] },
                { activities: [{ name: 'X' }, { name: 'C' }] },
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
        sut = new ExclusiveCut(cutArcs);

        sut.validate(inputDFG);
        const result: string = sut.getFeedback();

        expect(result).toEqual(
            'An exclusive cut must not contain any arc between the subsets of its origin-DFG.',
        );
    });
});
