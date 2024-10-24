import { EventLog } from '../classes/event-log';
import { EventLogParserService } from './event-log-parser.service';

describe('EventLogParserService', () => {
    let sut: EventLogParserService;

    beforeEach(() => {
        sut = new EventLogParserService();
    });

    it('empty event log', () => {
        const eventLogStr: string = '';

        const result: EventLog = sut.parse(eventLogStr);

        expect(result).toEqual({ traces: [] });
    });

    it('one simple trace', () => {
        const eventLogStr: string = 'A B C';

        const result: EventLog = sut.parse(eventLogStr);

        expect(result).toEqual({
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
            ],
        });
    });

    it('multiletter activities', () => {
        const eventLogStr: string = 'ABC XYZ';

        const result: EventLog = sut.parse(eventLogStr);

        expect(result).toEqual({
            traces: [
                { activities: [{ name: 'ABC' }, { name: 'XYZ' }] },
            ],
        });
    });

    it('multiple traces with spaces around the +', () => {
        const eventLog: string = 'A B C + X Y Z';

        const result: EventLog = sut.parse(eventLog);

        expect(result).toEqual({
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
                { activities: [{ name: 'X' }, { name: 'Y' }, { name: 'Z' }] },
            ],
        });
    });

    it('multiple traces without spaces around the +', () => {
        const eventLog: string = 'A B C+X Y Z';

        const result: EventLog = sut.parse(eventLog);

        expect(result).toEqual({
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
                { activities: [{ name: 'X' }, { name: 'Y' }, { name: 'Z' }] },
            ],
        });
    });

    it('multiple traces in multiple lines', () => {
        const eventLog: string = 'A B C +\nX Y Z';

        const result: EventLog = sut.parse(eventLog);

        expect(result).toEqual({
            traces: [
                { activities: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] },
                { activities: [{ name: 'X' }, { name: 'Y' }, { name: 'Z' }] },
            ],
        });
    });
});
