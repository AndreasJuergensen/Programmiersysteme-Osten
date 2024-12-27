import { Activities } from './activities';
import { Arcs } from './arcs';
import { Dfg, DfgBuilder } from './dfg';

describe('Partition a Dfg by cutted arcs', () => {
    it('with all activities in one partition (a1 is empty)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('play', 'A'))
            .addArc(sut.getArc('play', 'B'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const a1: Activities = new Activities();
        const a2: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');

        expect(result).toEqual([a1, a2]);
    });

    it('with all activities in one partition (a2 is empty)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'stop'))
            .addArc(sut.getArc('B', 'stop'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities();

        expect(result).toEqual([a1, a2]);
    });

    it('without any cutted arc', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs();

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities();
        const expectedPartitions: Activities[] = [a1, a2];

        expect(result).toEqual(expectedPartitions);
    });

    it('without having all activities from Dfg contained in partitions', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('D')
            .addFromPlayArc('A')
            .addToStopArc('D')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'D')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'D'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities().createActivity('A');
        const expectedA2: Activities = new Activities().createActivity('D');

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid exclusive cut (with two partitions)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('B', 'stop'))
            .addArc(sut.getArc('play', 'A'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities().createActivity('B');
        const expectedA2: Activities = new Activities().createActivity('A');

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid exclusive cut (with one partition)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addToStopArc('B')
            .addFromPlayArc('C')
            .addArc('C', 'B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('B', 'stop'))
            .addArc(sut.getArc('play', 'A'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities()
            .createActivity('C')
            .createActivity('B')
            .createActivity('A');
        const expectedA2: Activities = new Activities();

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid sequence cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addArc('C', 'A')
            .addArc('C', 'B')
            .addArc('B', 'C')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'stop'))
            .addArc(sut.getArc('C', 'B'))
            .addArc(sut.getArc('B', 'C'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities()
            .createActivity('A')
            .createActivity('C');
        const expectedA2: Activities = new Activities().createActivity('B');

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid parallel cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addArc('C', 'A')
            .addArc('C', 'B')
            .addArc('B', 'C')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'C'))
            .addArc(sut.getArc('C', 'A'))
            .addArc(sut.getArc('C', 'B'))
            .addArc(sut.getArc('B', 'C'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities()
            .createActivity('A')
            .createActivity('C')
            .createActivity('B');
        const expectedA2: Activities = new Activities();

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid loop cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'A')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'A'))
            .addArc(sut.getArc('B', 'C'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities().createActivity('A');
        const expectedA2: Activities = new Activities().createActivity('B');

        expect(result).toEqual([expectedA1, expectedA2]);
    });
});

describe('Cut a DFG by any partitions', () => {
    it('is possible by exclusive cut ', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });

    it('is possible by sequence cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addToStopArc('B')
            .addToStopArc('C')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });

    it('is not possible by sequence cut if play is connected to a2', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addToStopArc('B')
            .addToStopArc('C')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeFalse();
    });

    it('is not possible by sequence cut if stop is connected to a1', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addToStopArc('A')
            .addToStopArc('B')
            .addToStopArc('C')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeFalse();
    });

    it('is possible by parallel cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addArc('A', 'B')
            .addArc('B', 'A')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });

    it('is possible by loop cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'A')
            .addToStopArc('B')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });
});
