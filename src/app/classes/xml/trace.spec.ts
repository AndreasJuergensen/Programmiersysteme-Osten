import { Trace } from './trace';

describe('trace', () => {
    var sut: Trace;

    it('is represented as the events speparated by one space', () => {
        sut = new Trace({
            event: [
                { string: [{ '@_key': 'concept:name', '@_value': 'A' }] },
                { string: [{ '@_key': 'concept:name', '@_value': 'B' }] },
                { string: [{ '@_key': 'concept:name', '@_value': 'C' }] },
            ],
        });

        const result: string = sut.toString();

        expect(result).toEqual('A B C');
    });
});
