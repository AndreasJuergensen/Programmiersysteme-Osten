import { Event, eventFromXml } from './event';

describe('event', () => {
    var sut: Event;

    it('must not contain no element with key concept:name', () => {
        sut = eventFromXml({ string: [] });

        expect(sut.toString).toThrow();
    });

    it('should contain at least one element with key concept:name', () => {
        sut = eventFromXml({
            string: { '@_key': 'concept:name', '@_value': 'EventName' },
        });

        const result: string = sut.toString();

        expect(result).toEqual('EventName');
    });

    it('is represented as the value of the concept:name-element', () => {

        sut = eventFromXml({
            string: [
                { '@_key': 'concept:name', '@_value': 'EventName' },
                { '@_key': 'org:resource', '@_value': 'Joseph' },
            ],
        });

        const result: string = sut.toString();

        expect(result).toEqual('EventName');
    });
});
