import { EventLog } from '../classes/event-log';
import { DFG, DFGTransition } from '../classes/petri-net';
import { CalculateDfgService } from './calculate-dfg.service';

describe('CalculateDfgService', () => {
    const playTransition: DFGTransition = { id: 'play', name: 'play' };
    const stopTransition: DFGTransition = { id: 'stop', name: 'stop' };
    let sut: CalculateDfgService;

    beforeEach(() => {
        sut = new CalculateDfgService();
    });

    it('empty event log -> empty dfg', () => {
        const eventLog: EventLog = { traces: [] };

        const result: DFG = sut.calculate(eventLog);

        expect(result).toEqual({
            id: 'pnt1',
            transitions: [playTransition, stopTransition],
            arcs: [{ start: playTransition, end: stopTransition }],
        });
    });

    it('event log with one trace containing one activity', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }] }],
        };

        const result: DFG = sut.calculate(eventLog);

        const dfgt1: DFGTransition = { id: 'dfgt1', name: 'A' };
        expect(result).toEqual({
            id: 'pnt1',
            transitions: [playTransition, dfgt1, stopTransition],
            arcs: [
                { start: playTransition, end: dfgt1 },
                { start: dfgt1, end: stopTransition },
            ],
        });
    });

    // it('event log with one trace containing two activities', () => {
    //     const eventLog: EventLog = {
    //         traces: [{ activities: [{ name: 'A' }, { name: 'B' }] }],
    //     };

    //     const result: DFG = sut.calculate(eventLog);

    //     const dfgt1: DFGTransition = { id: 'dfgt1', name: 'A' };
    //     const dfgt2: DFGTransition = { id: 'dfgt2', name: 'B' };
    //     expect(result).toEqual({
    //         id: 'pnt1',
    //         transitions: [playTransition, dfgt1, dfgt2, stopTransition],
    //         arcs: [
    //             { start: playTransition, end: dfgt1 },
    //             { start: dfgt1, end: dfgt2 },
    //             { start: dfgt2, end: stopTransition },
    //         ],
    //     });
    // });
});
