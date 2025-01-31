import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    private readonly validEventLogPattern =
        /^[^\+\s]+(?:\s[^\+\s]+|\s*\+\s*[^\+\s]+)*$/;
    private readonly multiplicityPattern =
        /[a-zA-Z]+\*[0-9]+|[0-9]+\*[a-zA-Z]+/;

    constructor() {}

    validateInput(input: string): boolean {
        return this.validateInputInChunks(input, this.validEventLogPattern);
    }

    checkForMultiplicityPattern(input: string): boolean {
        return this.checkForMultiplicitiesInChunks(
            input,
            this.multiplicityPattern,
        );
    }

    private validateInputInChunks(input: string, pattern: RegExp): boolean {
        const chunkSize = 50000;

        if (input.length <= chunkSize) {
            return pattern.test(input);
        }

        let start = 0;
        while (start < input.length) {
            let end = Math.min(start + chunkSize, input.length);
            if (end < input.length) {
                while (
                    end <= input.length &&
                    (input[end] === ' ' ||
                        input[end] === '+' ||
                        input[end + 1] === ' ' ||
                        input[end + 1] === '+')
                ) {
                    end++;
                }
            }

            let chunk = input.substring(start, end + 1);

            if (!pattern.test(chunk)) {
                return false;
            }

            start = end;
        }

        return true;
    }

    private checkForMultiplicitiesInChunks(
        input: string,
        pattern: RegExp,
    ): boolean {
        const chunkSize = 5000;

        if (input.length <= chunkSize) {
            return pattern.test(input);
        }

        let start = 0;
        while (start < input.length) {
            let end = Math.min(start + chunkSize, input.length);

            if (end < input.length) {
                while (
                    end <= input.length &&
                    (input[end] === ' ' ||
                        input[end] === '+' ||
                        input[end] === '*' ||
                        input[end + 1] === ' ' ||
                        input[end + 1] === '+' ||
                        input[end + 1] === '*')
                ) {
                    end++;
                }
            }

            let chunk = input.substring(start, end + 1);

            if (pattern.test(chunk)) {
                return true;
            }

            start = end;
        }

        return false;
    }
}
