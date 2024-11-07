import { DfgJson } from '../classes/dfg/dfg';
import { EventLog } from '../classes/event-log';
import { CalculateDfgService } from './calculate-dfg.service';

describe('CalculateDfgService', () => {
    let sut: CalculateDfgService;

    beforeEach(() => {
        sut = new CalculateDfgService();
    });

    it('empty event log -> empty dfg', () => {
        const eventLog: EventLog = { traces: [] };

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            activities: ['play', 'stop'],
            arcs: [{ start: 'play', end: 'stop' }],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing one activity', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }] }],
        };

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
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }, { name: 'B' }] }],
        };

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
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }] },
            ],
        };

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
        const eventLog: EventLog = {
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'A' }] },
                { activities: [{ name: 'B' }, { name: 'C' }, { name: 'A' }] },
            ],
        };

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
});
