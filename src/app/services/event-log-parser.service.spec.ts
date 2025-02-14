import { Activity } from '../classes/dfg/activities';
import { EventLog, Trace } from '../classes/event-log';
import { EventLogParserService } from './event-log-parser.service';

describe('EventLogParserService', () => {
    let sut: EventLogParserService;

    beforeEach(() => {
        sut = new EventLogParserService();
    });

    it('empty event log', () => {
        const eventLogStr: string = '';

        const result: EventLog = sut.parse(eventLogStr);

        expect(result).toEqual(new EventLog([]));
    });

    it('one simple trace', () => {
        const eventLogStr: string = 'A B C';
        const result: EventLog = sut.parse(eventLogStr);

        const expectedEventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
        ]);

        expect(result).toEqual(expectedEventLog);
    });

    it('one simple trace with many whitespaces', () => {
        const eventLogStr: string = ' A    B C ';
        const result: EventLog = sut.parse(eventLogStr);

        const expectedEventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
        ]);

        expect(result).toEqual(expectedEventLog);
    });

    it('multiletter activities', () => {
        const eventLogStr: string = 'ABC XYZ';

        const result: EventLog = sut.parse(eventLogStr);

        const expectedEventLog = new EventLog([
            new Trace([new Activity('ABC'), new Activity('XYZ')]),
        ]);
        expect(result).toEqual(expectedEventLog);
    });

    it('multiple traces with spaces around the +', () => {
        const eventLog: string = 'A B C + X Y Z';

        const result: EventLog = sut.parse(eventLog);

        const expectedEventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
            new Trace([
                new Activity('X'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
        ]);
        expect(result).toEqual(expectedEventLog);
    });

    it('multiple traces without spaces around the +', () => {
        const eventLog: string = 'A B C+X Y Z';

        const result: EventLog = sut.parse(eventLog);

        const expectedEventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
            new Trace([
                new Activity('X'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
        ]);
        expect(result).toEqual(expectedEventLog);
    });

    it('multiple traces in multiple lines', () => {
        const eventLog: string = 'A B C +\nX Y Z';

        const result: EventLog = sut.parse(eventLog);

        const expectedEventLog = new EventLog([
            new Trace([
                new Activity('A'),
                new Activity('B'),
                new Activity('C'),
            ]),
            new Trace([
                new Activity('X'),
                new Activity('Y'),
                new Activity('Z'),
            ]),
        ]);
        expect(result).toEqual(expectedEventLog);
    });
});
