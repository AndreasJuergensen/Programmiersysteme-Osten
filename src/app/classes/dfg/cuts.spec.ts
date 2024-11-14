import { EventLog } from '../event-log';
import { Activities } from './activities';
import { Arcs, DfgArc } from './arcs';
import { ExclusiveCut, ParallelCut, SequenceCut } from './cut';
import { Dfg, DfgBuilder } from './dfg';

describe('A Dfg', () => {
    it('can not be cut in a1 and a2 if a1 is empty', () => {
        const inputEventLog: EventLog = new EventLog([]);
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const a1: Activities = new Activities();
        const a2: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if a2 is empty', () => {
        const inputEventLog: EventLog = new EventLog([]);
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities();

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if the union of a1 and a2 does not contain all activities of the dfg', () => {
        const inputEventLog: EventLog = new EventLog([]);
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .build();
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if the union of a1 and a2 does contain more activities than the dfg', () => {
        const inputEventLog: EventLog = new EventLog([]);
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .build();
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities()
            .createActivity('B')
            .createActivity('C');

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it('can not be cut in a1 and a2 if the intersection of a1 and a2 is not empty', () => {
        const inputEventLog: EventLog = new EventLog([]);
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .build();
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');

        const result: boolean = sut.canBeCutIn(a1, a2);

        expect(result).toBeFalse();
    });

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty ' +
            'and no arc between a1 and a2 exists ' +
            '(ExclusiveCut)',
        () => {
            const inputEventLog: EventLog = new EventLog([]);
            const sut: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('B')
                .createActivity('C')
                .addArc('play', 'A')
                .addArc('A', 'B')
                .addArc('B', 'stop')
                .addArc('play', 'C')
                .addArc('C', 'stop')
                .build();
            const a1: Activities = new Activities()
                .createActivity('A')
                .createActivity('B');
            const a2: Activities = new Activities().createActivity('C');

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty, ' +
            'every activity in a1 can reach every activity in a2' +
            'and no arc from a2 to a1 exists ' +
            '(SequenceCut)',
        () => {
            const inputEventLog: EventLog = new EventLog([]);
            const sut: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('B')
                .createActivity('C')
                .createActivity('D')
                .addArc('play', 'A')
                .addArc('play', 'B')
                .addArc('A', 'C')
                .addArc('B', 'D')
                .addArc('C', 'D')
                .addArc('D', 'C')
                .addArc('C', 'stop')
                .addArc('D', 'stop')
                .build();
            const a1: Activities = new Activities()
                .createActivity('A')
                .createActivity('B');
            const a2: Activities = new Activities()
                .createActivity('C')
                .createActivity('D');

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );

    it(
        'can be cut in a1 and a2 if a1 and a2 are not empty, ' +
            'the union of a1 and a2 is exactly T, ' +
            'the intersection of a1 and a2 is empty, ' +
            'every activity in a1 can reach every activity in a2' +
            'every activity in a2 can reach every activity in a1' +
            'every activity in a1 can be passed through on the way from play to stop only visiting activities in a1 ' +
            'every activity in a2 can be passed through on the way from play to stop only visiting activities in a2 ' +
            '(ParallelCut)',
        () => {
            const inputEventLog: EventLog = new EventLog([]);
            const sut: Dfg = new DfgBuilder()
                .createActivity('A')
                .createActivity('B')
                .createActivity('C')
                .createActivity('D')
                .addArc('play', 'A')
                .addArc('play', 'C')
                .addArc('A', 'B')
                .addArc('A', 'C')
                .addArc('A', 'D')
                .addArc('B', 'C')
                .addArc('B', 'D')
                .addArc('C', 'A')
                .addArc('C', 'B')
                .addArc('D', 'A')
                .addArc('D', 'B')
                .addArc('C', 'D')
                .addArc('B', 'stop')
                .addArc('D', 'stop')
                .build();
            const a1: Activities = new Activities()
                .createActivity('A')
                .createActivity('B');
            const a2: Activities = new Activities()
                .createActivity('C')
                .createActivity('D');

            const result: boolean = sut.canBeCutIn(a1, a2);

            expect(result).toBeTrue();
        },
    );
});

describe('An ExclusiveCut', () => {
    it('is not possible if an arc from a1 to a2 exists', () => {
        const inputEventLog: EventLog = new EventLog([]);
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
        const inputEventLog: EventLog = new EventLog([]);
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
});

describe('A SequenceCut', () => {
    it('is not possible if at least one activity in a2 can not be reached from at least one activity in a1', () => {
        const inputEventLog: EventLog = new EventLog([]);
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
        const inputEventLog: EventLog = new EventLog([]);
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
        const inputEventLog: EventLog = new EventLog([]);
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
        const inputEventLog: EventLog = new EventLog([]);
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
        const inputEventLog: EventLog = new EventLog([]);
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
        const inputEventLog: EventLog = new EventLog([]);
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
