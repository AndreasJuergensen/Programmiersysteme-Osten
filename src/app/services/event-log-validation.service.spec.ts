import { EventLogValidationService } from './event-log-validation.service';

describe('EventLogValidationService', () => {
    let sut: EventLogValidationService;

    beforeEach(() => {
        sut = new EventLogValidationService();
    });

    it('empty string', () => {
        const input: string = '';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });

    it('string starts with a plus "+" ', () => {
        const input: string = '+A B C + D';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });

    it('string / Traces separated by two plusses "++" ', () => {
        const input: string = 'A B C ++ D';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });

    it('valid string / event log ', () => {
        const input: string = 'A B C + X Y Z + Test Test1 Test2';
        const result = sut.validateInput(input);
        expect(result).toBeTrue();
    });
});
