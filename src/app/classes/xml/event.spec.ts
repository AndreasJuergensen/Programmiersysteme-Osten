import { Event, EventXml } from './event';

describe('event', () => {
    var sut: Event;

    it('should contain at least one element with key concept:name', () => {
        sut = new Event({ string: [] });

        expect(sut.toString).toThrow();
    });

    it('is represented as the value of the concept:name-element', () => {

        sut = new Event({
            string: [
                { '@_key': 'concept:name', '@_value': 'EventName' },
                { '@_key': 'org:resource', '@_value': 'Joseph' },
            ],
        });

        const result: string = sut.toString();

        expect(result).toEqual('EventName');
    });
});
