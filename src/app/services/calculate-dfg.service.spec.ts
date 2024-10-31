import { DFG } from '../classes/dfg';
import { EventLog } from '../classes/event-log';
import { DFGTransition, TransitionToTransitionArc } from '../classes/petri-net';
import { CalculateDfgService } from './calculate-dfg.service';

describe('CalculateDfgService', () => {
    const playTransition: DFGTransition = { id: 'play', name: 'play' };
    const stopTransition: DFGTransition = { id: 'stop', name: 'stop' };
    let sut: CalculateDfgService;
    let dfg: DFG;

    beforeEach(() => {
        sut = new CalculateDfgService();
        dfg = new DFG();
    });

    it('empty event log -> empty dfg', () => {
        const eventLog: EventLog = { traces: [] };

        const result: DFG = sut.calculate(eventLog);

        function customizeDFG(): DFG {
            const dfg: DFG = new DFG();
            dfg.transitions
                .set(playTransition.name, playTransition)
                .set(stopTransition.name, stopTransition);
            dfg.arcs.add({ start: playTransition, end: stopTransition });
            return dfg;
        }
        expect(result).toEqual(customizeDFG());

        // expect(result).toEqual({
        //     id: 'pnt1',
        //     transitions: [playTransition, stopTransition],
        //     arcs: [{ start: playTransition, end: stopTransition }],
        // });
    });

    it('event log with one trace containing one activity', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }] }],
        };

        const result: DFG = sut.calculate(eventLog);

        function customizeDFG(): DFG {
            const dfgt1: DFGTransition = { id: 'dfgt1', name: 'A' };
            dfg.transitions
                .set(playTransition.name, playTransition)
                .set(dfgt1.name, dfgt1)
                .set(stopTransition.name, stopTransition);
            dfg.arcs.add({ start: playTransition, end: dfgt1 });
            dfg.arcs.add({ start: dfgt1, end: stopTransition });
            return dfg;
        }
        expect(result).toEqual(customizeDFG());

        // expect(result).toEqual({
        //     id: 'pnt1',
        //     transitions: [playTransition, dfgt1, stopTransition],
        //     arcs: [
        //         { start: playTransition, end: dfgt1 },
        //         { start: dfgt1, end: stopTransition },
        //     ],
        // });
    });

    it('event log with one trace containing two activities', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }, { name: 'B' }] }],
        };

        const result: DFG = sut.calculate(eventLog);

        function customizeDFG(): DFG {
            const dfgt1: DFGTransition = { id: 'dfgt1', name: 'A' };
            const dfgt2: DFGTransition = { id: 'dfgt2', name: 'B' };
            dfg.transitions
                .set(playTransition.name, playTransition)
                .set(dfgt1.name, dfgt1)
                .set(dfgt2.name, dfgt2)
                .set(stopTransition.name, stopTransition);
            dfg.arcs.add({ start: playTransition, end: dfgt1 });
            dfg.arcs.add({ start: dfgt1, end: dfgt2 });
            dfg.arcs.add({ start: dfgt2, end: stopTransition });
            return dfg;
        }
        expect(result).toEqual(customizeDFG());

        // expect(result).toEqual({
        //     id: 'pnt1',
        //     transitions: [playTransition, dfgt1, dfgt2, stopTransition],
        //     arcs: [
        //         { start: playTransition, end: dfgt1 },
        //         { start: dfgt1, end: dfgt2 },
        //         { start: dfgt2, end: stopTransition },
        //     ],
        // });
    });

    it('event log with one trace containing double activities', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }] },
            ],
        };

        const result: DFG = sut.calculate(eventLog);

        function customizeDFG(): DFG {
            const dfgt1: DFGTransition = { id: 'dfgt1', name: 'A' };
            const dfgt2: DFGTransition = { id: 'dfgt2', name: 'B' };
            dfg.transitions
                .set(playTransition.name, playTransition)
                .set(dfgt1.name, dfgt1)
                .set(dfgt2.name, dfgt2)
                .set(stopTransition.name, stopTransition);
            dfg.arcs.add({ start: playTransition, end: dfgt1 });
            dfg.arcs.add({ start: dfgt1, end: dfgt2 });
            dfg.arcs.add({ start: dfgt2, end: dfgt1 });
            dfg.arcs.add({ start: dfgt1, end: stopTransition });
            return dfg;
        }
        expect(result).toEqual(customizeDFG());
    });

    it('event log with two traces containing double activities', () => {
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }] },
                { activities: [{ name: 'B' }, { name: 'C' }, { name: 'A' }] },
            ],
        };

        const result: DFG = sut.calculate(eventLog);

        function customizeDFG(): DFG {
            const dfgt1: DFGTransition = { id: 'dfgt1', name: 'A' };
            const dfgt2: DFGTransition = { id: 'dfgt2', name: 'B' };
            const dfgt3: DFGTransition = { id: 'dfgt3', name: 'C' };
            dfg.transitions
                .set(playTransition.name, playTransition)
                .set(dfgt1.name, dfgt1)
                .set(dfgt2.name, dfgt2)
                .set(dfgt3.name, dfgt3)
                .set(stopTransition.name, stopTransition);
            dfg.arcs.add({ start: playTransition, end: dfgt1 });
            dfg.arcs.add({ start: dfgt1, end: dfgt2 });
            dfg.arcs.add({ start: dfgt2, end: dfgt1 });
            dfg.arcs.add({ start: dfgt1, end: stopTransition });
            dfg.arcs.add({ start: playTransition, end: dfgt2 });
            dfg.arcs.add({ start: dfgt2, end: dfgt3 });
            dfg.arcs.add({ start: dfgt3, end: dfgt1 });
            return dfg;
        }
        expect(result).toEqual(customizeDFG());
    });
});
