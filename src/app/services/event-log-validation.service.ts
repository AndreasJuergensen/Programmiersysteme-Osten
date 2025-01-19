import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    private readonly validEventLogPattern =
        /^[^\+\s]+(?:\s[^\+\s]+|\s*\+\s*[^\+\s]+)*$/;
    private readonly multiplicityPattern =
        /[0-9]+[\*{1}][^\*^0-9]+|[^\*^0-9]+[\*{1}][0-9]+/;
    private readonly chunkSize = 2000;
    constructor() {}

    // validateInput(input: string): boolean {
    //     return this.validEventLogPattern.test(input);
    // }

    // checkForMultiplicityPattern(input: string): boolean {
    //     return this.multiplicityPattern.test(input);
    // }

    validateInput(input: string): boolean {
        return this.validateInChunks(input, this.validEventLogPattern);
    }

    checkForMultiplicityPattern(input: string): boolean {
        return this.validateInChunks(input, this.multiplicityPattern);
    }

    private validateInChunks(input: string, pattern: RegExp): boolean {
        const chunkSize = 10000;
        const contextSize = 5;
        if (input.length <= this.chunkSize) {
            return pattern.test(input); // Base case: no need to chunk
        }

        // const chunks = this.chunkString(input, this.chunkSize);

        // for (const chunk of chunks) {
        //     if (!pattern.test(chunk)) {
        //         return false; // If any chunk fails, the whole input is invalid
        //     }
        // }
        /*
        let start = 0;
        while (start < input.length) {
            let end = Math.min(start + chunkSize, input.length);

            // Find a suitable split point (space or end of string)
            while (
                end > start &&
                !/\s/.test(input[end - 1]) &&
                input[end - 1] !== '+'
            ) {
                end--;
            }

            //Handle the case where no suitable split point is found
            if (end === start) {
                end = Math.min(start + chunkSize, input.length);
            }

            const chunk = input.substring(start, end).trim(); // Trim whitespace

            console.log(chunk);

            // Check for invalid chunks (lone plus)
            if (
                chunk === '+' ||
                chunk.startsWith('+ ') ||
                chunk.endsWith(' +')
            ) {
                return false;
            }

            if (!pattern.test(chunk)) {
                return false;
            }

            start = end;
        }
            */
        for (let i = 0; i < input.length; i += chunkSize) {
            let start = Math.max(0, i - contextSize);
            let end = Math.min(input.length, i + chunkSize + contextSize);

            let chunk = input.substring(start, end).trim();

            if (!pattern.test(chunk)) {
                return false;
            }
        }
        return true; // All chunks passed validation
    }

    private chunkString(str: string, size: number): string[] {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array(numChunks);

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substring(o, o + size);
        }

        return chunks;
    }
}
