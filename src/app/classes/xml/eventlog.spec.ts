import { EventLog } from './eventlog';

describe('event log', () => {
    var sut: EventLog;

    it('is represented as the events speparated by a + and a linebreak', () => {
        sut = new EventLog({
            trace: [
                {
                    event: [
                        {
                            string: [
                                { '@_key': 'concept:name', '@_value': 'A' },
                            ],
                        },
                        {
                            string: [
                                { '@_key': 'concept:name', '@_value': 'B' },
                            ],
                        },
                        {
                            string: [
                                { '@_key': 'concept:name', '@_value': 'C' },
                            ],
                        },
                    ],
                },
                {
                    event: [
                        {
                            string: [
                                { '@_key': 'concept:name', '@_value': 'X' },
                            ],
                        },
                        {
                            string: [
                                { '@_key': 'concept:name', '@_value': 'Y' },
                            ],
                        },
                        {
                            string: [
                                { '@_key': 'concept:name', '@_value': 'Z' },
                            ],
                        },
                    ],
                },
            ],
        });

        const result: string = sut.toString();

        expect(result).toEqual('A B C +\nX Y Z');
    });
});
