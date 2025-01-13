import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class EventLogValidationService {
    private readonly validEventLogPattern =
        /^(\([A-Za-z][A-Za-z0-9\_]*\)|[A-Za-z][A-Za-z0-9\_]*)(?:(\s(\([A-Za-z][A-Za-z0-9\_]*\)|[A-Za-z][A-Za-z0-9\_]*))|(\s*\+\s*(\([A-Za-z][A-Za-z0-9\_]*\)|[A-Za-z][A-Za-z0-9\_]*)))*$/;

    constructor() {}

    validateInput(input: string): boolean {
        return this.validEventLogPattern.test(input);
    }
}
