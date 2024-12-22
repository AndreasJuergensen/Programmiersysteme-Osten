import { Activity, Activities } from './dfg/activities';
import { ExclusiveCut } from './dfg/cut';
import { EventLog, Trace } from './event-log';

describe('An Exclusive Cut', () => {
    it('split an EventLog with two minimum traces', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A')]),
            new Trace([new Activity('B')]),
        ]);
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');
        const exclusiveCut: ExclusiveCut = new ExclusiveCut(a1, a2);

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('B')]),
        ]);

        const result: EventLog[] = sut.splitByExclusiveCut(a1);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });

    it('split an EventLog with several possible exclusive cuts', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A')]),
            new Trace([new Activity('B')]),
            new Trace([new Activity('C')]),
        ]);
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities()
            .createActivity('B')
            .createActivity('C');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('B')]),
            new Trace([a2.getActivityByName('C')]),
        ]);

        const result: EventLog[] = sut.splitByExclusiveCut(a1);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });

    it('split an extensive EventLog', () => {
        const sut: EventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('D'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('A'),
                new Activity('B'),
                new Activity('D'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('D'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('Y'),
                new Activity('W'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('Y'),
                new Activity('W'),
                new Activity('X'),
                new Activity('W'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('X'),
                new Activity('W'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('X'),
                new Activity('W'),
                new Activity('X'),
                new Activity('W'),
            ]),
        ]);
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B')
            .createActivity('D')
            .createActivity('C');
        const a2: Activities = new Activities()
            .createActivity('Z')
            .createActivity('Y')
            .createActivity('W')
            .createActivity('X');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([
                a1.getActivityByName('A'),
                a1.getActivityByName('B'),
                a1.getActivityByName('D'),
            ]),
            new Trace([
                a1.getActivityByName('A'),
                a1.getActivityByName('B'),
                a1.getActivityByName('C'),
                a1.getActivityByName('A'),
                a1.getActivityByName('B'),
                a1.getActivityByName('D'),
            ]),
            new Trace([
                a1.getActivityByName('A'),
                a1.getActivityByName('B'),
                a1.getActivityByName('C'),
                a1.getActivityByName('D'),
            ]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([
                a2.getActivityByName('Z'),
                a2.getActivityByName('Y'),
                a2.getActivityByName('W'),
            ]),
            new Trace([
                a2.getActivityByName('Z'),
                a2.getActivityByName('Y'),
                a2.getActivityByName('W'),
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
            ]),
            new Trace([
                a2.getActivityByName('Z'),
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
            ]),
            new Trace([
                a2.getActivityByName('Z'),
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
            ]),
        ]);

        const result: EventLog[] = sut.splitByExclusiveCut(a1);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });
});

describe('An Sequence Cut', () => {
    it('split an EventLog with a minimum trace', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
        ]);
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('B')]),
        ]);

        const result: EventLog[] = sut.splitBySequenceCut(a2);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });

    it('split an extensive EventLog', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('Z')]),
            new Trace([
                new Activity('A'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('X'),
                new Activity('W'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('X'),
                new Activity('W'),
                new Activity('V'),
                new Activity('Z'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('X'),
                new Activity('W'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('X'),
                new Activity('W'),
                new Activity('V'),
            ]),
        ]);
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities()
            .createActivity('Z')
            .createActivity('Y')
            .createActivity('X')
            .createActivity('W')
            .createActivity('V');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A')]),
            new Trace([a1.getActivityByName('A')]),
            new Trace([a1.getActivityByName('A')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('Z')]),
            new Trace([a2.getActivityByName('Y'), a2.getActivityByName('Z')]),
            new Trace([a2.getActivityByName('X'), a2.getActivityByName('W')]),
            new Trace([
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
                a2.getActivityByName('V'),
                a2.getActivityByName('Z'),
            ]),
            new Trace([
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
                a2.getActivityByName('Y'),
                a2.getActivityByName('Z'),
            ]),
            new Trace([
                a2.getActivityByName('X'),
                a2.getActivityByName('W'),
                a2.getActivityByName('V'),
            ]),
        ]);

        const result: EventLog[] = sut.splitBySequenceCut(a2);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });
});

describe('A Parallel Cut', () => {
    it('split an EventLog with two minimum traces', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('B'), new Activity('A')]),
        ]);
        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A')]),
            new Trace([a1.getActivityByName('A')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('B')]),
            new Trace([a2.getActivityByName('B')]),
        ]);

        const result: EventLog[] = sut.splitByParallelCut(a1);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });

    it('split an extensive EventLog', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('A'), new Activity('Y')]),
            new Trace([
                new Activity('A'),
                new Activity('Z'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('Z'),
                new Activity('B'),
                new Activity('Y'),
            ]),
            new Trace([new Activity('Z'), new Activity('Y')]),
            new Trace([new Activity('Z'), new Activity('B')]),
            new Trace([
                new Activity('Z'),
                new Activity('Y'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('A'),
                new Activity('Y'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('Y'),
                new Activity('A'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('Z'),
                new Activity('A'),
                new Activity('B'),
                new Activity('Z'),
                new Activity('Y'),
            ]),
        ]);
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities()
            .createActivity('Z')
            .createActivity('Y');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([
                a2.getActivityByName('Z'),
                a2.getActivityByName('Z'),
                a2.getActivityByName('Y'),
            ]),
        ]);

        const result: EventLog[] = sut.splitByParallelCut(a1);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });
});

describe('A Loop Cut', () => {
    it('split an EventLog with two traces', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
                new Activity('A'),
                new Activity('B'),
            ]),
        ]);
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('C')]),
        ]);

        const result: EventLog[] = sut.splitByLoopCut(a1, a2);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });

    it('split an extensive EventLog', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([
                new Activity('B'),
                new Activity('Z'),
                new Activity('Y'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('Z'),
                new Activity('Y'),
                new Activity('A'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('Y'),
                new Activity('A'),
                new Activity('B'),
            ]),
            new Trace([
                new Activity('B'),
                new Activity('Z'),
                new Activity('Y'),
                new Activity('B'),
                new Activity('Z'),
                new Activity('Y'),
                new Activity('A'),
                new Activity('B'),
                new Activity('Y'),
                new Activity('B'),
            ]),
        ]);
        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities()
            .createActivity('Z')
            .createActivity('Y');

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('A'), a1.getActivityByName('B')]),
            new Trace([a1.getActivityByName('B')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Z'), a2.getActivityByName('Y')]),
            new Trace([a2.getActivityByName('Y')]),
        ]);

        const result: EventLog[] = sut.splitByLoopCut(a1, a2);

        expect(result).toEqual([expectedEventLog1, expectedEventLog2]);
    });
});

describe('A Flower Model', () => {
    it('split an EventLog', () => {
        const sut: EventLog = new EventLog([
            new Trace([new Activity('A')]),
            new Trace([new Activity('B')]),
            new Trace([new Activity('C')]),
            new Trace([new Activity('A'), new Activity('B')]),
            new Trace([new Activity('A'), new Activity('C')]),
            new Trace([new Activity('A'), new Activity('D')]),
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
        ]);

        const expectedEventLog1: EventLog = new EventLog([
            new Trace([new Activity('A')]),
        ]);
        const expectedEventLog2: EventLog = new EventLog([
            new Trace([new Activity('B')]),
        ]);
        const expectedEventLog3: EventLog = new EventLog([
            new Trace([new Activity('C')]),
        ]);
        const expectedEventLog4: EventLog = new EventLog([
            new Trace([new Activity('D')]),
        ]);
        const result: EventLog[] = sut.splitByFlowerFallThrough();

        expect(result).toEqual([
            expectedEventLog1,
            expectedEventLog2,
            expectedEventLog3,
            expectedEventLog4,
        ]);
    });
});
