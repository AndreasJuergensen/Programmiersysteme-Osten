import { DfgJson } from '../classes/dfg';
import { EventLog } from '../classes/event-log';
import { DFGTransition } from '../classes/petri-net';
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

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            transitions: [
                { id: 'play', name: 'play' },
                { id: 'stop', name: 'stop' }
            ],
            arcs: [
                { start: 'play', end: 'stop' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });

    it('event log with one trace containing one activity', () => {
        const eventLog: EventLog = {
            traces: [{ activities: [{ name: 'A' }] }],
        };

        const result: DfgJson = sut.calculate(eventLog).asJson();

        const expectedDfg: DfgJson = {
            transitions: [
                { id: 'play', name: 'play' },
                { id: 'stop', name: 'stop' },
                { id: 'dfgt1', name: 'A' },
            ],
            arcs: [
                { start: 'play', end: 'dfgt1' },
                { start: 'dfgt1', end: 'stop' },
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
            transitions: [
                { id: 'play', name: 'play' },
                { id: 'stop', name: 'stop' },
                { id: 'dfgt1', name: 'A' },
                { id: 'dfgt2', name: 'B' },
            ],
            arcs: [
                { start: 'play', end: 'dfgt1' },
                { start: 'dfgt1', end: 'dfgt2' },
                { start: 'dfgt2', end: 'stop' },
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
            transitions: [
                { id: 'play', name: 'play' },
                { id: 'stop', name: 'stop' },
                { id: 'dfgt1', name: 'A' },
                { id: 'dfgt2', name: 'B' },
            ],
            arcs: [
                { start: 'play', end: 'dfgt1' },
                { start: 'dfgt1', end: 'dfgt2' },
                { start: 'dfgt2', end: 'dfgt1' },
                { start: 'dfgt1', end: 'stop' },
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
            transitions: [
                { id: 'play', name: 'play' },
                { id: 'stop', name: 'stop' },
                { id: 'dfgt1', name: 'A' },
                { id: 'dfgt2', name: 'B' },
                { id: 'dfgt3', name: 'C' },
            ],
            arcs: [
                {start: "play", end: "dfgt1"},
                {start: "dfgt1", end: "dfgt2"},
                {start: "dfgt2", end: "dfgt1"},
                {start: "dfgt1", end: "stop"},
                {start: "play", end: "dfgt2"},
                {start: "dfgt2", end: "dfgt3"},
                {start: "dfgt3", end: "dfgt1"}
            ]
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
            transitions: [
                { id: 'play', name: 'play' },
                { id: 'stop', name: 'stop' },
                { id: 'dfgt1', name: 'A' },
                { id: 'dfgt2', name: 'B' },
                { id: 'dfgt3', name: 'C' },
            ],
            arcs: [
                { start: 'play', end: 'dfgt1' },
                { start: 'dfgt1', end: 'dfgt2' },
                { start: 'dfgt2', end: 'dfgt1' },
                { start: 'dfgt1', end: 'stop' },
                { start: 'play', end: 'dfgt2' },
                { start: 'dfgt1', end: 'dfgt3' },
                { start: 'dfgt3', end: 'stop' },
            ],
        };
        expect(result).toEqual(expectedDfg);
    });
});
