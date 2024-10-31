import { DFG } from '../classes/dfg';
import { EventLog } from '../classes/event-log';
import { DFGTransition, TransitionToTransitionArc } from '../classes/petri-net';
import { CalculateDfgService } from './calculate-dfg.service';

describe('CalculateDfgService', () => {
    const playTransition: DFGTransition = { id: 'play', name: 'play' };
    const stopTransition: DFGTransition = { id: 'stop', name: 'stop' };
    let sut: CalculateDfgService;
    let expectedDfg: DFG;

    beforeEach(() => {
        sut = new CalculateDfgService();
        expectedDfg = new DFG('pnt1');
    });

    it('empty event log -> empty dfg', () => {
        const eventLog: EventLog = { traces: [] };

        const result: DFG = sut.calculate(eventLog);

        expectedDfg.addPlayToStopArc();
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing one activity', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }] }],
        };

        const result: DFG = sut.calculate(eventLog);

        expectedDfg.addFromPlayArc('A');
        expectedDfg.addToStopArc('A');
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing two activities', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }, { name: 'B' }] }],
        };

        const result: DFG = sut.calculate(eventLog);

        expectedDfg.addFromPlayArc('A');
        expectedDfg.addArc('A', 'B');
        expectedDfg.addToStopArc('B');
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing double activities', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }] },
            ],
        };

        const result: DFG = sut.calculate(eventLog);

        expectedDfg.addFromPlayArc('A');
        expectedDfg.addArc('A', 'B');
        expectedDfg.addArc('B', 'A');
        expectedDfg.addToStopArc('A');
        expect(result).toEqual(expectedDfg);
    });

    it('event log with two traces containing double activities', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }] },
                { activities: [{ name: 'B' }, { name: 'C' }, { name: 'A' }] },
            ],
        };

        const result: DFG = sut.calculate(eventLog);

        expectedDfg.addFromPlayArc('A');
        expectedDfg.addArc('A', 'B');
        expectedDfg.addArc('B', 'A');
        expectedDfg.addToStopArc('A');
        expectedDfg.addFromPlayArc('B');
        expectedDfg.addArc('B', 'C');
        expectedDfg.addArc('C', 'A');
        expect(result).toEqual(expectedDfg);
    });

    it('event log with two traces containing double activities', () => {
        const eventLog: EventLog = {
            traces: [
                {
                    activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }],
                },
                {
                    activities: [{ name: 'B' }, { name: 'A' }, { name: 'C' }],
                },
            ],
        };

        const result: DFG = sut.calculate(eventLog);

        expectedDfg.addFromPlayArc('A');
        expectedDfg.addArc('A', 'B');
        expectedDfg.addArc('B', 'A');
        expectedDfg.addToStopArc('A');
        expectedDfg.addFromPlayArc('B');
        expectedDfg.addArc('A', 'C');
        expectedDfg.addToStopArc('C');
        expect(result).toEqual(expectedDfg);
    });
});
