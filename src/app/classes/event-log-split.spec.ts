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
});
