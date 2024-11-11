import { Activity } from '../classes/dfg/activities';
import { DfgJson } from '../classes/dfg/dfg';
import { EventLog, Trace } from '../classes/event-log';
import { CalculateDfgService } from './calculate-dfg.service';

describe('CalculateDfgService', () => {
    let sut: CalculateDfgService;

    beforeEach(() => {
        sut = new CalculateDfgService();
    });

    it('empty event log -> empty dfg', () => {
        const eventLog: EventLog = new EventLog([]);

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop'],
            arcs: [{ start: 'play', end: 'stop' }],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing one activity', () => {
        const eventLog = new EventLog([new Trace([new Activity('A')])]);

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop', 'A'],
            arcs: [
                { start: 'play', end: 'A' },
                { start: 'A', end: 'stop' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing two activities', () => {
        const eventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
        ]);

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop', 'A', 'B'],
            arcs: [
                { start: 'play', end: 'A' },
                { start: 'A', end: 'B' },
                { start: 'B', end: 'stop' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing double activities', () => {
        const eventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('A'),
            ]),
        ]);

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop', 'A', 'B'],
            arcs: [
                { start: 'play', end: 'A' },
                { start: 'A', end: 'B' },
                { start: 'B', end: 'A' },
                { start: 'A', end: 'stop' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with two traces containing double activities', () => {
        const eventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('A'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('C'),
                new Activity('A'),
            ]),
        ]);

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop', 'A', 'B', 'C'],
            arcs: [
                { start: 'play', end: 'A' },
                { start: 'A', end: 'B' },
                { start: 'B', end: 'A' },
                { start: 'A', end: 'stop' },
                { start: 'play', end: 'B' },
                { start: 'B', end: 'C' },
                { start: 'C', end: 'A' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with two traces containing double activities', () => {
        const eventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('A'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('A'),
                new Activity('C'),
            ]),
        ]);

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop', 'A', 'B', 'C'],
            arcs: [
                { start: 'play', end: 'A' },
                { start: 'A', end: 'B' },
                { start: 'B', end: 'A' },
                { start: 'A', end: 'stop' },
                { start: 'play', end: 'B' },
                { start: 'A', end: 'C' },
                { start: 'C', end: 'stop' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('output event log with one trace containing one activity previously safed in DFG', () => {
        const eventLog = new EventLog([new Trace([new Activity('A')])]);

        const result: EventLog = sut.calculate(eventLog).getEventLog();

        expect(result).toEqual(eventLog);
    });

    // it('update EventLog safed in DFG and output updated Event Log', () => {
    //     const eventLog = new EventLog([new Trace([new Activity('A')])]);

    //     const newEventLog: EventLog = new EventLog([
    //         new Trace([new Activity('B')]),
    //     ]);

    //     const update: EventLog = sut
    //         .calculate(eventLog)
    //         .updateEventLog(newEventLog);

    //     const result: EventLog = update.getEventLog();

    //     expect(result).toEqual(newEventLog);
    // });
});
