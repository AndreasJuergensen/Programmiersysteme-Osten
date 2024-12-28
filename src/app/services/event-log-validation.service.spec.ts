import { EventLogValidationService } from './event-log-validation.service';

describe('EventLogValidationService False Cases', () => {
    let sut: EventLogValidationService;

    beforeEach(() => {
        sut = new EventLogValidationService();
    });

    it('empty string', () => {
        const input: string = '';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });

    it('event log starts with a plus "+" ', () => {
        const input: string = '+A B C + D';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });

    it('string / Traces separated by a plus two times in a row "++" ', () => {
        const input: string = 'A B C ++ D';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });

    it('too many whitespaces means more than one whitespace betweens Strings', () => {
        const input: string = 'A   B';
        const result = sut.validateInput(input);
        expect(result).toBeFalse();
    });
});

describe('EventLogValidationService True Cases', () => {
    let sut: EventLogValidationService;

    beforeEach(() => {
        sut = new EventLogValidationService();
    });
    it('valid string / event log ', () => {
        const input: string = 'A B C + X Y Z + Test Test1 Test2';
        const result = sut.validateInput(input);
        expect(result).toBeTrue();
    });

    it('valid string / event log an optional whitespace around the plus', () => {
        const input: string = 'A+B C + X Y Z +N M +L K';
        const result = sut.validateInput(input);
        expect(result).toBeTrue();
    });
});
