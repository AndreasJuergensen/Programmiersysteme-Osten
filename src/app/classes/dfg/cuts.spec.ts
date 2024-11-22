import { EventLog } from '../event-log';
import { Activities } from './activities';
import { Arcs, DfgArc } from './arcs';
import { ExclusiveCut, LoopCut, ParallelCut, SequenceCut } from './cut';
import { Dfg, DfgBuilder } from './dfg';

describe('A Dfg', () => {
    it('can not be cut in a1 and a2 if a1 is empty', () => {
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

        const partitions: Activities[] = sut.calculatePartitions(cuttedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if a2 is empty', () => {
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

        const partitions: Activities[] = sut.calculatePartitions(cuttedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if the union of a1 and a2 does not contain all activities of the dfg', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'stop'));

        const partitions: Activities[] = sut.calculatePartitions(cuttedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if the union of a1 and a2 does contain more activities than the dfg', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const cuttedArcs: Arcs = new Arcs().addArc(sut.getArc('A', 'B'));

        const partitions: Activities[] = sut.calculatePartitions(cuttedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];
        a2.createActivity('C');

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if the intersection of a1 and a2 is not empty', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .addArc('B', 'A')
            .build();
        const cuttedArcs: Arcs = new Arcs().addArc(sut.getArc('A', 'B'));

        const partitions: Activities[] = sut.calculatePartitions(cuttedArcs);
        const a1: Activities = partitions[0];
        const a2: Activities = partitions[1];

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty and ' +
            'no arc between a1 and a2 exists ' +
            '(ExclusiveCut)',
        () => {
            const sut: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('B')
                .createActivity('C')
                .addFromPlayArc('A')
                .addFromPlayArc('C')
                .addToStopArc('B')
                .addToStopArc('C')
                .addArc('A', 'B')
                .build();
            const cuttedArcs: Arcs = new Arcs()
                .addArc(sut.getArc('play', 'C'))
                .addArc(sut.getArc('C', 'stop'));

            const partitions: Activities[] =
                sut.calculatePartitions(cuttedArcs);
            const a1: Activities = partitions[0];
            const a2: Activities = partitions[1];

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty, ' +
            'every activity in a1 can reach every activity in a2 and ' +
            'no arc from a2 to a1 exists ' +
            '(SequenceCut)',
        () => {
            const sut: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('B')
                .createActivity('C')
                .createActivity('D')
                .addFromPlayArc('A')
                .addFromPlayArc('B')
                .addArc('A', 'C')
                .addArc('B', 'D')
                .addArc('C', 'D')
                .addArc('D', 'C')
                .addToStopArc('C')
                .addToStopArc('D')
                .build();
            const cuttedArcs: Arcs = new Arcs()
                .addArc(sut.getArc('A', 'C'))
                .addArc(sut.getArc('B', 'D'));

            const partitions: Activities[] =
                sut.calculatePartitions(cuttedArcs);
            const a1: Activities = partitions[0];
            const a2: Activities = partitions[1];

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty, ' +
            'every activity in a1 can reach every activity in a2, ' +
            'every activity in a2 can reach every activity in a1, ' +
            'every activity in a1 can be passed through on the way from play to stop only visiting activities in a1 and ' +
            'every activity in a2 can be passed through on the way from play to stop only visiting activities in a2 ' +
            '(ParallelCut)',
        () => {
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
                .addArc(sut.getArc('play', 'C'))
                .addArc(sut.getArc('C', 'stop'))
                .addArc(sut.getArc('A', 'C'))
                .addArc(sut.getArc('C', 'A'))
                .addArc(sut.getArc('C', 'B'))
                .addArc(sut.getArc('B', 'C'));

            const partitions: Activities[] =
                sut.calculatePartitions(cuttedArcs);
            const a1: Activities = partitions[0];
            const a2: Activities = partitions[1];

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty, ' +
            'every arc from play ends in a1, ' +
            'every arc to stop starts in a1, ' +
            'play reaches every activity in a1play, ' +
            'every activity in a2stop reaches every activity in a1play, ' +
            'every activity in a1stop reaches stop and ' +
            'every activity in a1stop reaches every activity in a2play ' +
            '(LoopCut)',
        () => {
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
                .addArc(sut.getArc('C', 'A'))
                .addArc(sut.getArc('B', 'C'));

            const partitions: Activities[] =
                sut.calculatePartitions(cuttedArcs);
            const a1: Activities = partitions[0];
            const a2: Activities = partitions[1];

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );
});

describe('An ExclusiveCut', () => {
    it('is not possible if an arc from a1 to a2 exists', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const arcs: Arcs = new Arcs().addArc(
            new DfgArc(
                activities.getActivityByName('A'),
                activities.getActivityByName('B'),
            ),
        );
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');
        const sut: ExclusiveCut = new ExclusiveCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if an arc from a2 to a1 exists', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const arcs: Arcs = new Arcs().addArc(
            new DfgArc(
                activities.getActivityByName('A'),
                activities.getActivityByName('B'),
            ),
        );
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');
        const sut: ExclusiveCut = new ExclusiveCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if any of the partitions do not start at play', () => {
        const activities: Activities = new Activities()
            .createActivity('play')
            .createActivity('stop')
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.stopActivity,
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: ExclusiveCut = new ExclusiveCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if any of the partitions do not end at stop', () => {
        const activities: Activities = new Activities()
            .createActivity('play')
            .createActivity('stop')
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: ExclusiveCut = new ExclusiveCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });
});

describe('A SequenceCut', () => {
    it('is not possible if at least one activity in a2 can not be reached from at least one activity in a1', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs().addArc(
            new DfgArc(
                activities.getActivityByName('B'),
                activities.getActivityByName('C'),
            ),
        );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: SequenceCut = new SequenceCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if an arc from a2 to a1 exists', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const arcs: Arcs = new Arcs().addArc(
            new DfgArc(
                activities.getActivityByName('B'),
                activities.getActivityByName('A'),
            ),
        );
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');
        const sut: SequenceCut = new SequenceCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });
});

describe('A ParallelCut', () => {
    it('is not possible if at least one activity in a1 has no arc to at least one activity in a2', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.stopActivity,
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: ParallelCut = new ParallelCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if at least one activity in a1 can not be reached from at least one activity in a2', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.stopActivity,
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: ParallelCut = new ParallelCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if at least one activity in a1 can not be passed through on the way from play to stop only visiting activities in a1', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.stopActivity,
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: ParallelCut = new ParallelCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if at least on activity in a2 can not be passed through on the way from play to stop only visiting activities in a2', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.stopActivity,
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: ParallelCut = new ParallelCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });
});

describe('A LoopCut', () => {
    it('is not possible if play has at least one arc to a2', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: LoopCut = new LoopCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if stop has at least one arcs from a2', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: LoopCut = new LoopCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if play does not reach every arc from a1play', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: LoopCut = new LoopCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if at least on activity in a2stop does not reach every arc from a1play', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('B'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: LoopCut = new LoopCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if at least on activity in a1stop does not reach stop', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: LoopCut = new LoopCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });

    it('is not possible if at least on activity in a1stop does not reach at least one activity in a2play', () => {
        const activities: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C');
        const arcs: Arcs = new Arcs()
            .addArc(
                new DfgArc(
                    activities.playActivity,
                    activities.getActivityByName('A'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('B'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('B'),
                    activities.stopActivity,
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('A'),
                    activities.getActivityByName('C'),
                ),
            )
            .addArc(
                new DfgArc(
                    activities.getActivityByName('C'),
                    activities.getActivityByName('A'),
                ),
            );
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');
        const sut: LoopCut = new LoopCut(a1, a2);

        const result: boolean = sut.isPossible(activities, arcs);

        expect(result).toBeFalse();
    });
});
